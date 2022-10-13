// import { hello } from "./site/sub";
// hello();
import { createApp } from 'vue';
import StgSliderApp from './StgSliderApp.vue';
import OtherSliderApp from './OtherSliderApp.vue';

createApp(StgSliderApp).mount('#stgSlider');
createApp(OtherSliderApp).mount('#otherSlider');