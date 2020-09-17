import Vue from 'vue'
import {
  Input,
  Button,
  RadioGroup,
  RadioButton,
  Select,
  Option,
  Tree,
  Slider,
  ButtonGroup,
  Loading,
  Checkbox,
  Dialog,
  Message,
  Popover
} from 'element-ui'

Vue.use(Input)
Vue.use(Button)
Vue.use(RadioGroup)
Vue.use(RadioButton)
Vue.use(Select)
Vue.use(Option)
Vue.use(Tree)
Vue.use(Slider)
Vue.use(ButtonGroup)
Vue.use(Loading.directive)
Vue.use(Checkbox)
Vue.use(Dialog)
Vue.use(Popover)

Vue.prototype.$loading = Loading.service
Vue.prototype.$message = Message;
