class ResultJson {
  constructor(obj) {
    this.ALL_EVENT = document.querySelectorAll('.js-eventResult');
    this.numForFirstView = 3; // 初期選択
    this.regionIdArr = []; // 地域固有ID
    this.ALL_EVENT.forEach(
      (sec) => {
        this.regionIdArr.push(sec.id);
      }
    );
    this.closeBtnFlg = obj.showClose;
    this.requestURLHeader = '/event/2021/assets/regionals/';
    // 文字置換
    this.letterToBeFixed = ['<', '>'];
    this.letterToBePut = ['&lt;', '&gt;'];
    this.judgeLoadJson();
    window.addEventListener('resize', () => {
      this.contentHeightAdjust();
    });
  }

  judgeLoadJson() {
    // 一個の地域DIVJSON読込処理
    this.regionIdArr.forEach(
      (sec, stageIndex) => {
        const myElement = document.querySelector(`#${sec}`);

        if (myElement.querySelector('.js-tableToLoadJson')) { // MT書出jsonタグ有無判定
          const jsonURL = `${this.requestURLHeader}js/ranking_${sec}.json?${Date.now()}`;
          const request = new XMLHttpRequest();

          request.open('GET', jsonURL);
          request.responseType = 'json';
          request.send();
          request.onload = () => {
            if (request.response) {
              this.setUpTable(request.response, stageIndex); // テーブル設定
              this.tableSelectTab(stageIndex); // タブ設定
            }
          };
          request.onerror = () => {
            console.log('error');
          };
        }
      }
    );
  }

  setUpTable(data, stageIndex) {
    const parentSec = document.querySelector(`#${this.regionIdArr[stageIndex]}`);
    // ナビ
    const tableTabs = parentSec.querySelector('.regional-resultsNavi');
    tableTabs.classList.add('is-active');
    // 表示、突破チーム数
    const qalifiedTeamsNum = this.ALL_EVENT[stageIndex].dataset.qualified;
    const displayedTeamsNum = this.ALL_EVENT[stageIndex].dataset.displayed;
    // 文字化け対応文字列
    const replaceNameArr = this.ALL_EVENT[stageIndex].dataset.ngname.split(',');
    const replacePicArr = this.ALL_EVENT[stageIndex].dataset.ngnamepic.split(',');
    // ステージID
    const stageIdArr = this.ALL_EVENT[stageIndex].dataset.stageid.split(',');
    stageIdArr.push('total');
    // 表組コンテナ
    const elementToAdd = parentSec.querySelector('.regional-resultsTables');
    // テーブル
    let tebleIndex = 0;
    let tableHTML = '';
    const arrangedTableArr = [];

    // JSON内ステージ分処理
    Object.keys(data).forEach((keyStageID) => {
      // MTで入力されたstageID分処理
      stageIdArr.forEach((stageID, i) => {
        // MTステージIDとJSONステージID一致
        if (stageID === keyStageID) {
          tebleIndex += 1; // カウントアップ
          // 表組初期選択
          const activeClass = tebleIndex === this.numForFirstView ? ' is-active' : '';

          // 表共通ヘッダー
          tableHTML = `
            <div class="regional-resultsTables__item${activeClass}">
              <table class="regional-resultsTable">
                <tbody>
                  <tr class="regional-resultsTable__headline">
                    ${stageID === 'total' ? '<th class="qualification">Qualification</th>' : ''}
                    <th class="rank${stageID === 'total' ? ' fourCol' : ''}">Place</th>
                    <th class="teamName${stageID === 'total' ? ' fourCol' : ''}">Team name</th>
                    <th class="time${stageID === 'total' ? ' fourCol' : ''}">time</th>
                  </tr>
          `;

          // 表ボディ
          const STAGE_DATA = data[keyStageID].ranking;
          Object.keys(STAGE_DATA).forEach((key, i2) => {
            // 任意のチーム数分表示
            if (i2 < displayedTeamsNum) {
              tableHTML += `
                  <tr class="regional-resultsTable__item is-active" style="animation-delay: ${0.075 * i2}s">
              `;
              // 総合テーブル時、任意のチーム数分突破アイコンコラム追加
              if (stageID === 'total') {
                if (i2 < qalifiedTeamsNum) {
                  tableHTML += `
                      <td class="qualification"><span class="is-ok">OK</span></td>
                  `;
                } else {
                  tableHTML += `
                      <td class="qualification"><span>Not OK</span></td>
                  `;
                }
              }

              // チーム名処理
              let tempTeamName = STAGE_DATA[i2].team_name;
              let replaceCheck = false;

              // 文字化け対応
              /* eslint-disable */
              if (replaceNameArr != '') {
              /* eslint-enable */
                replaceNameArr.forEach((nameItem, altIndex) => {
                  if (tempTeamName.indexOf(nameItem) !== -1) {
                    tempTeamName = `<img src="${this.requestURLHeader}${replacePicArr[altIndex]}">`;
                    replaceCheck = !replaceCheck;
                  }
                });
              }

              // 文字化け対応なければエスケープ対応
              if (!replaceCheck) {
                this.letterToBeFixed.forEach((ltr, ltrind) => {
                  if (tempTeamName.indexOf(ltr) !== -1) {
                    tempTeamName = tempTeamName.replace(ltr, this.letterToBePut[ltrind]);
                  }
                });
              }

              tableHTML += `
                    <td class="rank">${STAGE_DATA[i2].rank}</td>
                    <td class="teamName">${tempTeamName}</td>
                    <td class="time">${STAGE_DATA[i2].time}</td>
                  </tr>
              `;
            }
          });

          // 表共通フッター
          tableHTML += `
                </tbody>
              </table>
            </div>
          `;

          // 表まとめ配列
          arrangedTableArr.splice(i, 0, tableHTML);
        }
      });
    });

    // 表示
    const allTableString = arrangedTableArr.join('');
    elementToAdd.innerHTML = allTableString;

    // 表を閉じるボタン表示の場合
    if (this.closeBtnFlg && displayedTeamsNum > 3) {
      elementToAdd.innerHTML += this.closeBtnFlg ? '<div class="regional-resultsTables__close js-tableCloseBtn is-close">全ての順位を見る</div>' : '';
      this.closeBtnFn();
    }
  }

  tableSelectTab(stageIndex) {
    const elementToAdd = document.querySelector(`#${this.regionIdArr[stageIndex]}`);
    const btnArr = elementToAdd.querySelectorAll('.regional-resultsNavi__link');
    const stageName = elementToAdd.querySelector('.regional-resultStName');
    const stageNameArr = stageName.querySelectorAll('.regional-resultStName__item');

    btnArr.forEach((btn) => {
      // 初期タブ設定
      if (Number(btn.getAttribute('data-tabIndex')) + 1 === this.numForFirstView) {
        btn.classList.add('is-active');
      }

      // クリックイベント
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const myIndex = Number(e.target.getAttribute('data-tabIndex'));
        const myParent = e.target.closest('.js-naviAndTables');
        const myTables = myParent.querySelector('.regional-resultsTables');
        const myTableArr = myTables.querySelectorAll('.regional-resultsTables__item');

        // 該当ボタン切り替え
        btnArr.forEach((btn2) => {
          btn2.classList.remove('is-active');
          if (myIndex === Number(btn2.getAttribute('data-tabIndex'))) btn2.classList.add('is-active');
        });

        // 該当ステージネーム切り替え
        stageNameArr.forEach((sn) => {
          sn.classList.remove('is-active');
          if (myIndex === Number(sn.getAttribute('data-stIndex'))) sn.classList.add('is-active');
        });

        // 該当成績テーブル切り替え
        myTableArr.forEach((table, tableIndex) => {
          table.classList.remove('is-active');
          if (myIndex === tableIndex) table.classList.add('is-active');
        });

        // 表を閉じるボタン表示の場合、テーブル高さによりY座表調整
        if (this.closeBtnFlg) {
          this.contentHeightAdjust();
        }
      });
    });
  }

  closeBtnFn() {
    const tableCloseBtn = document.querySelector('.js-tableCloseBtn');
    const tableCloseCont = document.querySelector('.js-tableCloseContainer');
    tableCloseCont.classList.add('tableCloseContainer');

    this.contentHeightAdjust();

    tableCloseBtn.addEventListener('click', (e) => {
      e.preventDefault();
      tableCloseBtn.classList.toggle('is-close');

      if (tableCloseBtn.classList.contains('is-close')) {
        tableCloseBtn.innerText = '全ての順位を見る';
      } else {
        tableCloseBtn.innerText = '閉じる';
      }

      this.contentHeightAdjust();
    });
  }

  contentHeightAdjust() {
    const tableCloseBtn = document.querySelector('.js-tableCloseBtn');
    const tableCloseCont = document.querySelector('.js-tableCloseContainer');
    const activeTable = document.querySelector('.regional-resultsTables__item.is-active');
    const thH = activeTable.querySelector('th').scrollHeight;
    const tbH = activeTable.querySelector('td').scrollHeight;
    const clH = tableCloseBtn.scrollHeight;

    if (tableCloseBtn.classList.contains('is-close')) {
      tableCloseCont.setAttribute('style', `max-height: ${thH + (tbH * 2.5) + clH}px;`);
    } else {
      tableCloseCont.setAttribute('style', `max-height: ${tableCloseCont.scrollHeight}px;`);
    }
  }
}

export default ResultJson;
