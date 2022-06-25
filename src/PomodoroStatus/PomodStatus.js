import { css } from "@emotion/css"

export function PomoStatus(props) {
  return (
    <p className={
      css`
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
    }> 
      {props.statusMessage} 
    </p>
  )
}