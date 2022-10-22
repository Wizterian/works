import YoutubeModal from '../../../common/js/site/YoutubeModal';


export default class Finals {
  constructor() {
    const pageIDEle = document.querySelector('.page-finalists').getAttribute('id');
    this.teamID = pageIDEle ? document.querySelector('.page-finalists').getAttribute('id').replace(/#/g, '') : '';

    this.vueInit(this.myDir, this.teamID);
  }

  vueInit(myDir, teamID) {
    /* eslint-disable */

    const finalistresults = Vue.createApp({
      data: () => {
        return {
          tables: null,
          areaNameTitle: '',
          block: '',
          finalTier: ''
        }
      },
      methods: {
        getTrackingEvent: function(e) {
          window.Tracking.onClick(e);
        },
				getStageThumb: function(key){
          let tmpStage = `/event/2021/assets/finalists/img/stage/`;
          if (key.includes('1')) {
            tmpStage += 'stage_red.png';
          } else if (key.includes('2')) {
            tmpStage += 'stage_blue.png';
          } else if (key.includes('3')) {
            tmpStage += 'stage_green.png';
          } else if (key.includes('4')) {
            tmpStage += 'stage_light.png';
          } else if (key.includes('5')) {
            tmpStage += 'stage_dark.png';
          }
          return tmpStage;
				},
				getCharThumb: function(key){
          let tmpChar = `/event/2021/assets/finalists/img/char/${key}`;
          return tmpChar;
				},
				getEventName: function(key){
          let tmpTitle = '';
          if (key === 'regionals') {
            tmpTitle += `${this.areaNameTitle} ${this.block} WINNER`;
          }else if (key === 'finals') {
            tmpTitle += `FINAL ${this.finalTier}`;
          }
          return tmpTitle;
				},
				getRoundName: function(key){
          let tmpTitle = '';
          if (key === 'ta') {
            tmpTitle = 'TIME ATTACK';
          }else if (key === 'best8') {
            tmpTitle = 'BEST 8';
          }else if (key === 'semi') {
            tmpTitle = 'SEMI FINAL';
          }else if (key === 'final') {
            tmpTitle = 'FINAL';
          }
          return tmpTitle;
				},
        putWinLoseColor: function(key){
          let tmpTxt = key;
          if (key.includes('WIN')) {
            tmpTxt = key.replace(/WIN/g, '<span class="win">WIN</span>');
          } else if (key.includes('LOSE')) {
            tmpTxt = key.replace(/LOSE/g,'<span class="lose">LOSE</span>');
          }
          return tmpTxt;
				},
      },
      mounted: function () {
        axios
          .get(`/event/2021/assets/finalists/teamdata/${teamID}/json/results.json`)
          .then(response => this.tables = response.data);

        const areaName = document.querySelector('.js-areaTitle');
        this.areaNameTitle = areaName ? areaName.textContent : '';

        const FRObj = document.querySelector('#finalistresults');
        this.block = FRObj.dataset.block;
        this.finalTier = FRObj.dataset.finaltier;
      },
      updated: function (){
        new YoutubeModal();
      }
    });
    finalistresults.mount('#finalistresults');


    const memberInfo = Vue.createApp({
      data: () => {
        return {
          profiles: null
        }
      },
      methods: {
				getMemberThumb: function(index){
          return `/event/2021/assets/finalists/teamdata/${teamID}/img/member0${index + 1}.png`;
				},
      },
      mounted: function () {
        axios
          .get(`/event/2021/assets/finalists/teamdata/${teamID}/json/profile.json`)
          .then(response => this.profiles = response.data);
      }
    });
    memberInfo.mount('#memberInfo');


    const finalistsIndex = Vue.createApp({
      data: () => {
        return {
          finalists: null
        }
      },
      methods: {
        getMyPageURL: function(tID) {
          return `/event/2021/finalists/${tID}.html`;
        },
        getTeamThumbURL: function(tID) {
          return `/event/2021/assets/finalists/teamdata/${tID}/img/team.png`;
        },
      },
      mounted: function () {
        axios
          .get(`/event/2021/assets/finalists/teamdata/finalists.json`)
          .then(response => this.finalists = response.data);
      }
    });
    finalistsIndex.mount('#finalistsIndex');

    /* eslint- enable */
  }
}
