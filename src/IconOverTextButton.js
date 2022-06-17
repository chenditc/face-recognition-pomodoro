import Icon from '@ant-design/icons';
import { Button } from 'antd';
import { css } from '@emotion/css'

function IconOverTextButton(props) {
  return (
  <Button onClick={props.onClick} className={css`height: 6.5em`} type="text">
    <Icon component={props.icon} className={
      css`
      color: "#1faa00";
      font-size: 4em;
    `
    } />
    <p> {props.text}</p>
  </Button>
  )
}

export default IconOverTextButton;