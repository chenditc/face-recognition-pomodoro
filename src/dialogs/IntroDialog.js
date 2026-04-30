import { Modal } from 'antd';

import { Typography } from '@rmwc/typography';
import '@rmwc/typography/styles';

import { Card, CardPrimaryAction} from '@rmwc/card';
import '@rmwc/card/styles';

import ReactMarkdown from 'react-markdown'
import { useI18n } from '../i18n';

function IntroDialog(props) {
  const { t } = useI18n();

  return (
    <Modal
      zIndex={1010}
      visible={props.open}
      onCancel={props.onClose}
      onOk={props.onClose}
      okText={t('intro.continue')}
      cancelButtonProps={{ style: { display: 'none' } }}
      maskClosable={false}
      destroyOnClose
      width="80vw"
      style={{ top: 24 }}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      title={t('intro.title')}
    >
          <div style={{padding: "10px"}} />
          <Card>
            <CardPrimaryAction>
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <Typography use="headline6" tag="h2">
                {t('intro.whatIsThis')}
                </Typography>
                <Typography
                  use="body1"
                  tag="div"
                  theme="textSecondaryOnBackground"
                >
                <ReactMarkdown children={t('intro.markdown')} />
                </Typography>
              </div>
            </CardPrimaryAction>
          </Card>
          <div style={{padding: "10px"}} />
          <Card>
            <CardPrimaryAction>
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <Typography use="headline6" tag="h2">
                {t('intro.leftCameraTitle')}
                </Typography>
                <Typography
                  use="body1"
                  tag="div"
                  theme="textSecondaryOnBackground"
                >
                <ReactMarkdown>{t('intro.leftCameraBody')}</ReactMarkdown>
                  
                </Typography>
              </div>
            </CardPrimaryAction>
          </Card>
          <div style={{padding: "10px"}} />
          <Card>
            <CardPrimaryAction>
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <Typography use="headline6" tag="h2">
                {t('intro.whyPopupTitle')}
                </Typography>
                <Typography
                  use="body1"
                  tag="div"
                  theme="textSecondaryOnBackground"
                >
                  {t('intro.whyPopupBody')}
                </Typography>
              </div>
            </CardPrimaryAction>
          </Card>
          <div style={{padding: "10px"}} />
          <Card>
            <CardPrimaryAction>
              <div style={{ padding: '0 1rem 1rem 1rem' }}>
                <Typography use="headline6" tag="h2">
                {t('intro.performanceTitle')}
                </Typography>
                <Typography
                  use="body1"
                  tag="div"
                  theme="textSecondaryOnBackground"
                >
                  {t('intro.performanceBody')}
                </Typography>
              </div>
            </CardPrimaryAction>
          </Card>
    </Modal>
  )
}

export default IntroDialog;
