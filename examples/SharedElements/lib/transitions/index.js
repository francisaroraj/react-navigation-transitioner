import { getFadeTransition } from './getFadeTransition';
import { getHorizontalTransition } from './getHorizontalTransitions';

const Transitions = {
  Fade: getFadeTransition,
  Horizontal: getHorizontalTransition,
}

export default Transitions;