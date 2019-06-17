(function (window) {
  function Bootstrap() {};

  Bootstrap.prototype.setBasicData = async function (window) {
    window.earlierWidth = window.innerWidth;
    window.earlierHeight = window.innerHeight;
    window.wbUser = wbUser;
    window.pageEnter = new Date().getTime();

    const virtualclass = new window.virtualclass();

    virtualclass.config.data = {};
    virtualclass.virtualclassIDBOpen = window.virtualclassOpenDB;
    window.virtualclass = virtualclass; // Need virtualclass object in each file

    virtualclass.gObj.displayError = 1;
    virtualclass.lang = {};
    virtualclass.lang.getString = window.getString;
    virtualclass.lang.message = window.message;
    virtualclass.gObj.mobileVchOffset = vhCheck();
    virtualclass.settings = window.settings;
    virtualclass.ioEventApi = ioEventApi;
    virtualclass.user = new window.user();
    virtualclass.storage = window.storage;
    virtualclass.wbCommon = window.wbCommon;
    virtualclass.recorder = window.recorder;
    virtualclass.vutil = window.vutil;
    virtualclass.system = window.system;

    wbUser.virtualclassPlay = +wbUser.virtualclassPlay;

    if (wbUser.virtualclassPlay) {
      // virtualclass.gObj.sessionClear = true;
      virtualclass.gObj.role = 's';
      localStorage.removeItem('teacherId');
      wbUser.id = 99955551230;
      virtualclass.gObj.uid = wbUser.id;
    }

    virtualclass.popup = new PopUp({ showOverlay: true });
    virtualclass.gObj.fromPageRefresh = true;

    if (virtualclass.isMiniFileIncluded('wb.min')) {
      virtualclass.gObj.displayError = 0;
    }

    if (window.virtualclass.error.length > 2) {
      window.virtualclass.error = [];
      return;
    }

    virtualclass.gObj.memberlistpending = [];
    virtualclass.gObj.veryFirstJoin = true;

    await virtualclass.storage.init();

  };

  Bootstrap.prototype.validDateSession = function () {
    let prvUser = localStorage.getItem('prvUser');
    const mySession = localStorage.getItem('thisismyplaymode');
    virtualclass.gObj.myConfig = localStorage.getItem('myConfig');

    let config;
    if (virtualclass.isPlayMode || (mySession !== null && mySession === 'thisismyplaymode')) {
      virtualclass.storage.config.endSession();
    } else if (prvUser !== null) {
      prvUser = JSON.parse(prvUser);
      if (prvUser.id !== wbUser.id || prvUser.room !== wbUser.room ||
        wbUser.role !== prvUser.role || prvUser.settings !== virtualclassSetting.settings) {
        virtualclass.storage.config.endSession();
      }
    } else if (virtualclass.gObj.myConfig !== null) {
      config = JSON.parse(virtualclass.gObj.myConfig);
      const roomCreatedTime = config.createdDate;
      const baseDate = new Date().getTime();
      const totalTime = baseDate - roomCreatedTime;
      // Session is clear after 3 hour continous session
      // ////////////////////1sec-1min--1hr--3hr/////////
      if (totalTime > (1000 * 60 * 60 * 3)) {
        virtualclass.storage.config.endSession();
      }
    }
  }


  Bootstrap.prototype.loadData = function () {
    if (roles.hasControls()) {
      localStorage.setItem('uRole', virtualclass.gObj.uRole);
    }

    if (localStorage.getItem('prvUser') === null) {
      virtualclass.setPrvUser();
    }

    virtualclass.createMainContainer();
    let wIds = localStorage.getItem('wIds');
    if (wIds != null) {
      wIds = JSON.parse(wIds);
      virtualclass.gObj.wIds = wIds;
      virtualclass.gObj.wbCount = wIds.length - 1;
    }

    const previousApp = JSON.parse(localStorage.getItem('prevApp'));
    virtualclass.gObj.prevApp = previousApp;


    if (previousApp != null) {
      virtualclass.previousApp = previousApp;
      let appNameUpper = previousApp.name;

      var appIs = appNameUpper.charAt(0).toUpperCase() + appNameUpper.slice(1);
      if (previousApp.name == 'Yts' || (previousApp.name == 'DocumentShare')) {
        if (previousApp.metaData == null) {
          var videoObj = null;
        } else {
          var videoObj = previousApp.metaData;
          videoObj.fromReload = true;
        }
      } else if (previousApp.name == 'Video') {
        if (previousApp.metaData == null || previousApp.metaData.init == null) {
          var videoObj = null;
        } else {
          var videoObj = previousApp.metaData;
          videoObj.fromReload = true;
        }
      } else if (previousApp.name == 'Whiteboard') {
        if (wIds == null) {
          virtualclass.gObj.wbCount = previousApp.wbn;
        }

        const currSlide = localStorage.getItem('currSlide');
        if (currSlide != null) {
          virtualclass.gObj.currSlide = currSlide;
          console.log('==== current slide ', virtualclass.gObj.currSlide);
        }
      }
    } else {
      var appIs = virtualclass.gObj.defaultApp;
    }

    if (typeof videoObj === 'undefined') {
      var videoObj = null;
    }

    virtualclass.precheck = localStorage.getItem('precheck');
    var isPrecheck = localStorage.getItem('precheck');
    if (isPrecheck != null) {
      virtualclass.isPrecheck = JSON.parse(isPrecheck);
    }

    if (wbUser.virtualclassPlay) {
      virtualclass.isPrecheck = false;
      virtualclass.enablePreCheck = false;
    } else {
      virtualclass.precheck = localStorage.getItem('precheck');
      virtualclass.enablePreCheck = true;
      var isPrecheck = localStorage.getItem('precheck');
      if (isPrecheck != null) {
        virtualclass.isPrecheck = JSON.parse(isPrecheck);
      }
    }

    if (virtualclass.enablePreCheck && (virtualclass.isPrecheck == null || !virtualclass.isPrecheck)) {
      virtualclass.makePreCheckAvailable = true;
    } else {
      virtualclass.makePreCheckAvailable = false;
      virtualclass.popup.waitMsg('refresh');
    }

    virtualclass.config.data.appIs = appIs;
    virtualclass.config.data.videoObj = videoObj;
  };

  Bootstrap.prototype.appInit = async function () {
    virtualclass.settings.init();
    await virtualclass.init(wbUser.role, virtualclass.config.data.appIs, virtualclass.config.data.videoObj);

    if (virtualclass.system.mybrowser.name === 'Edge') {
      const virtualclassContainer = document.getElementById('virtualclassCont');
      if (virtualclassContainer != null) {
        virtualclassContainer.classList.add('edge');
      }
    }

    if (!wbUser.virtualclassPlay) {
      virtualclass.editorRich.veryInit();
      // virtualclass.editorCode.veryInit();
    }
    virtualclass.gObj.testChatDiv = document.querySelector('#chat_div');
    virtualclass.gObj.testChatDiv.attachShadow({ mode: 'open' });
  };

  Bootstrap.prototype.setUpMedia = function () {
    if (roles.isStudent()) {
      const audioEnable = localStorage.getItem('audEnable');
      if (audioEnable !== null && audioEnable.ac === 'false') {
        virtualclass.user.control.mediaWidgetDisable();
        virtualclass.gObj.audioEnable = false;
      }
    }

    if (!virtualclass.gObj.hasOwnProperty('audIntDisable') && !virtualclass.gObj.hasOwnProperty('vidIntDisable')) {
      setTimeout(
        () => {
          virtualclass.media.init();
        }, 100, // TODO, this set time out need be removed
      );
    }
  }

  Bootstrap.prototype.readyToGo = async function (){
    if (virtualclass.isPrecheck != null) {
      if (typeof virtualclass.videoHost.gObj.MYSPEED === 'undefined') {
        virtualclass.videoHost.gObj.MYSPEED = 1;
      }
      await virtualclass.videoHost.afterSessionJoin();
    }

  }
  window.Bootstrap = Bootstrap;
}(window));
