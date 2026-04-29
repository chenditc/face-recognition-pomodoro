import { css } from "@emotion/css"
import { useI18n } from "../i18n";

export const pomoStatusClassName = css`
  font-size: 20vw;
  margin: 0 auto;
  text-align: center;
  @media (min-width: 700px) {
    font-size: 140px;
  }
  @media (max-width: 350px) {
    font-size: 75px;
  }
`

export function PomoStatus(props) {
  const { t } = useI18n();
  const statusMessage = props.focus ? t('status.working') : t('status.rest');
  const usedClassName = props.className || pomoStatusClassName
  return (
    <p className={usedClassName}> 
      {statusMessage} 
    </p>
  )
}
