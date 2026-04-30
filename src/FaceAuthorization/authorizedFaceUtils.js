const AUTHORIZED_FACE_PROFILE_VERSION = 1;
const REQUIRED_AUTH_FACE_SAMPLES = 5;

const FACE_MATCH_OPTIONS = {
  order: 2,
  multiplier: 25,
  min: 0.2,
  max: 0.8,
};

const FACE_MATCH_STRICTNESS_THRESHOLDS = {
  lenient: 0.45,
  balanced: 0.5,
  strict: 0.58,
};

function normalizeDescriptor(descriptor) {
  if (Array.isArray(descriptor)) return descriptor;
  if (ArrayBuffer.isView(descriptor)) return Array.from(descriptor);
  return [];
}

function isAuthorizedFaceEnrolled(profile) {
  return Array.isArray(profile?.descriptors) && profile.descriptors.length > 0;
}

function getFaceMatchThreshold(strictness = 'balanced') {
  return FACE_MATCH_STRICTNESS_THRESHOLDS[strictness] || FACE_MATCH_STRICTNESS_THRESHOLDS.balanced;
}

function getMatchDistance(descriptor1, descriptor2, options = { order: 2, multiplier: 25 }) {
  if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
    return Number.MAX_SAFE_INTEGER;
  }

  let sum = 0;
  for (let index = 0; index < descriptor1.length; index += 1) {
    const diff = !options.order || options.order === 2
      ? descriptor1[index] - descriptor2[index]
      : Math.abs(descriptor1[index] - descriptor2[index]);
    sum += !options.order || options.order === 2
      ? diff * diff
      : diff ** options.order;
  }
  return Math.round(100 * (options.multiplier || 20) * sum) / 100;
}

function normalizeDistance(distance, order, min, max) {
  if (distance === 0) return 1;
  const root = order === 2 ? Math.sqrt(distance) : distance ** (1 / order);
  const normalized = (1 - (root / 100) - min) / (max - min);
  return Math.round(100 * Math.max(Math.min(normalized, 1), 0)) / 100;
}

function findBestFaceMatch(descriptor, descriptors, options = FACE_MATCH_OPTIONS) {
  if (!Array.isArray(descriptor) || descriptor.length < 64 || !Array.isArray(descriptors) || descriptors.length === 0) {
    return { index: -1, distance: Number.POSITIVE_INFINITY, similarity: 0 };
  }

  let lowestDistance = Number.MAX_SAFE_INTEGER;
  let bestIndex = -1;

  for (let index = 0; index < descriptors.length; index += 1) {
    const candidate = descriptors[index];
    const nextDistance = Array.isArray(candidate) && candidate.length === descriptor.length
      ? getMatchDistance(descriptor, candidate, options)
      : Number.MAX_SAFE_INTEGER;
    if (nextDistance < lowestDistance) {
      lowestDistance = nextDistance;
      bestIndex = index;
    }
  }

  return {
    index: bestIndex,
    distance: bestIndex >= 0 ? lowestDistance : Number.POSITIVE_INFINITY,
    similarity: bestIndex >= 0
      ? normalizeDistance(lowestDistance, options.order || 2, options.min || 0, options.max || 1)
      : 0,
  };
}

function getAuthorizedFaceMatch(faces, authorizedFaceProfile, scoreThreshold, strictness = 'balanced') {
  const visibleFaces = faces.filter((face) => face.score > scoreThreshold);

  if (!isAuthorizedFaceEnrolled(authorizedFaceProfile)) {
    return {
      status: 'not-enrolled',
      authorizedFace: undefined,
      distance: Number.POSITIVE_INFINITY,
      matchIndex: -1,
      rawFaceCount: visibleFaces.length,
      similarity: 0,
    };
  }

  if (visibleFaces.length === 0) {
    return {
      status: 'no-face',
      authorizedFace: undefined,
      distance: Number.POSITIVE_INFINITY,
      matchIndex: -1,
      rawFaceCount: 0,
      similarity: 0,
    };
  }

  const descriptors = authorizedFaceProfile.descriptors
    .map((descriptor) => normalizeDescriptor(descriptor))
    .filter((descriptor) => descriptor.length > 0);
  if (descriptors.length === 0) {
    return {
      status: 'not-enrolled',
      authorizedFace: undefined,
      distance: Number.POSITIVE_INFINITY,
      matchIndex: -1,
      rawFaceCount: visibleFaces.length,
      similarity: 0,
    };
  }

  const liveDescriptorLength = visibleFaces
    .map((face) => normalizeDescriptor(face.embedding))
    .find((descriptor) => descriptor.length > 0)?.length || 0;
  const compatibleDescriptors = liveDescriptorLength > 0
    ? descriptors.filter((descriptor) => descriptor.length === liveDescriptorLength)
    : descriptors;
  if (liveDescriptorLength > 0 && compatibleDescriptors.length === 0) {
    return {
      status: 'profile-incompatible',
      authorizedFace: undefined,
      distance: Number.POSITIVE_INFINITY,
      matchIndex: -1,
      rawFaceCount: visibleFaces.length,
      similarity: 0,
    };
  }

  const threshold = getFaceMatchThreshold(strictness);
  let bestMatch = null;

  for (const face of visibleFaces) {
    const liveDescriptor = normalizeDescriptor(face.embedding);
    if (liveDescriptor.length === 0) continue;
    const match = findBestFaceMatch(liveDescriptor, compatibleDescriptors, FACE_MATCH_OPTIONS);
    if (!bestMatch || match.similarity > bestMatch.similarity) {
      bestMatch = {
        ...match,
        face,
      };
    }
  }

  if (bestMatch && bestMatch.similarity >= threshold) {
    return {
      status: 'authorized',
      authorizedFace: bestMatch.face,
      distance: bestMatch.distance,
      matchIndex: bestMatch.index,
      rawFaceCount: visibleFaces.length,
      similarity: bestMatch.similarity,
    };
  }

  return {
    status: 'unknown-face',
    authorizedFace: undefined,
    distance: bestMatch?.distance ?? Number.POSITIVE_INFINITY,
    matchIndex: bestMatch?.index ?? -1,
    rawFaceCount: visibleFaces.length,
    similarity: bestMatch?.similarity || 0,
  };
}

function getFaceThumbnail(webcamRef) {
  if (!webcamRef.current?.getScreenshot) return null;
  return webcamRef.current.getScreenshot();
}

export {
  AUTHORIZED_FACE_PROFILE_VERSION,
  FACE_MATCH_OPTIONS,
  FACE_MATCH_STRICTNESS_THRESHOLDS,
  REQUIRED_AUTH_FACE_SAMPLES,
  getAuthorizedFaceMatch,
  getFaceMatchThreshold,
  getFaceThumbnail,
  isAuthorizedFaceEnrolled,
  normalizeDescriptor,
};
