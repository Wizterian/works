import ResultJson from './site/ResultJson';

export default class Main {
  constructor(website) {
    new ResultJson({
      webID: website,
      showClose: false
    });
  }
}
