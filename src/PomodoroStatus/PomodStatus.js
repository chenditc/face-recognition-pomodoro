import { css } from "@emotion/css"

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
  const statusMessage = props.focus ? "WORKING" : "REST";
  const usedClassName = props.className || pomoStatusClassName
  return (
    <p className={usedClassName}> 
      {statusMessage} 
    </p>
  )
}