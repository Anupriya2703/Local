define(["SinopacMBConstants","CommonUtilities","FormControllerUtility","CampaignUtility", "ApplicationManager"],function(SinopacMBConstants,CommonUtilities,FormControllerUtility,CampaignUtility, ApplicationManager){ 
  return{
    customerID : "",
    userID : "",
    userIDlength : 0,
    indexValue : 0,
    campaigns: "",
    SessionManager: applicationManager.getSessionManager(),
    fidoAuthStatus:"",
    fidoAuthenticationDetails:{},
    currencydata: [],
    encryptedUsername: "",
    encryptedPassword: "",
    graphicPasswrd: "",
    isPwChangeRequired: "false",
    onNavigate: function(){
      var data = SinopacMBConstants.flags.CAD;
      var sm = applicationManager.getStorageManager();
      var setValue=sm.getStoredItem("setValue"); //1
	  
	  var swtStatus = false;
      sm.setStoredItem("swtStatus",swtStatus);

      if(setValue !== undefined && setValue !== "" && setValue !== null && setValue === 1){
        this.view.preShow = this.preShow;
        this.view.postShow = this.postShow;
        var firstTime = SinopacMBConstants.data;
		
        if(firstTime){
          var navManager = applicationManager.getNavigationManager();
          navManager.setCustomInfo("QuickLoginBlackListedDevices", "false");
          var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"TermsAndConditionsUIModule"});
          AppGroup.presentationController.getBlacklistedDevices();
        }
      } else {
        this.verifyApp();
      }

      this.view.postShow = this.postShow;
    },
    
    postShow: function(){
       var scope=this;
      scope.view.segFirstTimeScroll.onSwipe = function(context,state,index){
        scope.indexValue = index;
      };
      var sm = applicationManager.getStorageManager();     
      var rememberCustID = "";

      if(this.view.flxCheckBoxOn.isVisible === true){
        this.view.flxCheckBoxOff.setVisibility(false);
        this.view.flxCheckBoxOn.setVisibility(true);
        rememberCustID=sm.getStoredItem("rememberCustID"); 
        this.view.txtBoxIdNumber.text  = rememberCustID;
        customerID=sm.getStoredItem("customerID");
        userID=sm.getStoredItem("userID");
      }
      else{
        this.view.flxCheckBoxOn.setVisibility(false);
        this.view.flxCheckBoxOff.setVisibility(true); 
        this.view.txtBoxIdNumber.text  = rememberCustID;
      }
      this.view.btnStartBiometricLogin.onClick = this.initiateBiometrics;

    },
    checkPostShow: function(){
      var self = this;
      var min = JSON.parse(this.SessionManager.getPreLoginSystemConfiguration("APP_VERSION")[0].value).appversion.min;
      var max = JSON.parse(this.SessionManager.getPreLoginSystemConfiguration("APP_VERSION")[0].value).appversion.max;
      var currentVersion = appConfig.appVersion;
      this.view.lblVersion.text =  "版本"+" "+"V"+currentVersion.toString();
      if(currentVersion < min){
        this.view.commonPopup.lblHeading.text = "版本更新通知";
        this.view.commonPopup.lblDescription.text = "永豐銀行為確保您的使用流暢度,提供新版應用 程式,請您立即更新版本後再使用,謝謝。";
        this.view.commonPopup.Buttons.btnSPActionPrimary.text = "立即更新";
        this.view.commonPopup.Buttons.btnSPActionSecondary.text = "開啟網頁版";

        this.view.commonPopup.Buttons.btnSPActionPrimary.onClick = function(){
          self.view.flxVersionUpdate.setVisibility(false);
          self.view.flxPopups.setVisibility(false);
          kony.application.openURL("https://m.sinopac.com/m/m_home.aspx");
        }
        this.view.commonPopup.Buttons.btnSPActionSecondary.onClick = function(){
          self.view.flxVersionUpdate.setVisibility(false);
          self.view.flxPopups.setVisibility(false);
        }
        this.view.flxPopups.setVisibility(true);
        this.view.flxVersionUpdate.setVisibility(true);
      }
      if(currentVersion > min && currentVersion < max){
        this.view.commonPopup.lblHeading.text = "版本更新通知";
        this.view.commonPopup.lblDescription.text = "永豐銀行為確保您的使用流暢度,提供新版應用 程式,請您立即更新版本後再使用,謝謝。";
        
        this.view.commonPopup.Buttons.btnSPActionPrimary.text = "稍後更新";
        this.view.commonPopup.Buttons.btnSPActionSecondary.text = "立即更新";
        
        
        this.view.commonPopup.Buttons.btnSPActionPrimary.onClick = function(){
          self.view.flxVersionUpdate.setVisibility(false);
          self.view.flxPopups.setVisibility(false);
        }
        this.view.commonPopup.Buttons.btnSPActionSecondary.onClick = function(){
          self.view.flxVersionUpdate.setVisibility(false);
          self.view.flxPopups.setVisibility(false);
        }
        this.view.flxPopups.setVisibility(true);
        this.view.flxVersionUpdate.setVisibility(true);
      }
    },
    updateFormUI: function(viewModel){
      if (viewModel !== undefined) {
        if (viewModel.loadingIndicator) {
          if (viewModel.loadingIndicator.status === true) {

          } else {
            applicationManager.getPresentationUtility().dismissLoadingScreen();
          }
        }
        if(viewModel.outageMessage){
          this.outageMessage(viewModel.outageMessage);
        }
        if(viewModel.getCustomerID){
          applicationManager.getPresentationUtility().dismissLoadingScreen();
        }
        if(viewModel.deleteCustomerID){
          applicationManager.getPresentationUtility().dismissLoadingScreen();
        }

        if(viewModel.blackListedDevice){
          var blackedDevice = viewModel.blackListedDevice.BlacklistedDevices;
          var deviceInfo = kony.os.deviceInfo();
          var version = deviceInfo.name+" "+deviceInfo.version;
          var deviceName = deviceInfo.model;
          var deviceId = CommonUtilities.getDeviceID();
          if(blackedDevice[0].deviceName === deviceName && blackedDevice[0].OperatingSystem === version && blackedDevice[0].id === deviceId){
            //show popup
            this.blockDevice = true;
            this.view.flxPopups.isVisible = true;
            this.view.flxVersionUpdate.isVisible = true;
            this.view.commonPopup.lblHeading.text = "無法使用「生物辨識登入」功能";
            this.view.commonPopup.lblDescription.text = "為維護您的登入安全，部分手機型號目前無法使用「生物辨識登入」功能，建議您改用一般登入或其他快速登入方式進行使用。";
            this.view.commonPopup.Buttons.btnSPActionPrimary.text = "確定";
          }else{
            var configMap = {
              "promptMessage": "PLEASE AUTHENTICATE USING YOUR TOUCH ID",
              "fallbackTitle": "Please enter your Password",
              "description": "Description",
              "policy": constants.LOCAL_AUTHENTICATION_POLICY_DEV_OWNER_AUTH_WITH_BIOMETRICS,
              "subTitle": "sub title",
              "deviceCredentialAllowed": true,
              "confirmationRequired": true,
              "negativeButtonText": "Negative",
              "authenticators": [kony.localAuthentication.BIOMETRIC_WEAK, kony.localAuthentication.DEVICE_CREDENTIAL]
            };  
            kony.localAuthentication.authenticate(constants.LOCAL_AUTHENTICATION_MODE_BIOMETRICS, this.statusCB, configMap);
          }
        }
      }
    },
    statusCB: function(status, message, info) {  
      if (status == 5005 || status == 5007){     
        this.view.flxPopups.isVisible = true;
        this.view.flxVersionUpdate.isVisible = true;
        this.view.commonPopup.lblHeading.text = "無法使用「生物辨識登入」功能";
        this.view.commonPopup.lblDescription.text = "為維護您的登入安全，部分手機型號目前無法使用「生物辨識登入」功能，建議您改用一般登入或其他快速登入方式進行使用。";
        this.view.commonPopup.Buttons.btnSPActionPrimary.text = "確定";
      }  
      else{     
        //Native SDK method to check if device biometric has been updated
        //call DB addSDKLog
      }
    },
    preShow: function()
    {
      var scope = this;
      this.getPreLoginSystemConfig();
      this.view.flxMain.setVisibility(true);
      this.view.flxFirstTimeLaunch.setVisibility(false);
      //this.view.imgInvisibleTick.src="checkbox_off.png";

      var previousFormId = kony.application.getPreviousForm().id;
      if(previousFormId === "frmExchangeRateMovements"){
        this.closeExchange();
      }
      //this.view.HelpLine.flxGlobe.onClick=this.exchangeRatePopupOpen;
      //this.view.HelpLine1.flxGlobe.onClick=this.exchangeRatePopupOpen;
      this.view.commonPopup.Buttons.btnSPActionPrimary.onClick = this.showMain;
      this.view.flxCheckBoxOff.onClick = this.showCheck;
      this.view.flxCheckBoxOn.onClick = this. showUnCheck;
      this.view.imgStrikedIcon.onTouchStart = this.showPassword;
      this.view.txtBoxUserId.onEndEditing =  this.validateUserName;
      this.view.txtBoxOnlineBankingPasswords.onEndEditing = this.validatePassword;
      this.view.txtBoxIdNumber.onTextChange = this.validateUserID;
      this.view.txtBoxIdNumber.onEndEditing = this.personalIDCheck;
      this.view.lblNeedHelp.onTouchStart = this.Back;
      this.view.imgStrikedEyeIcon.onTouchStart = this.maskPassword;
      this.view.HelpLine.imgAudio.onTouchEnd = this.englishVersion;
      this.view.HelpLine1.imgAudio.onTouchEnd = this.englishVersion;
      this.view.flxCancel.onClick = this.mainForm;
      this.view.lblVersion.onTouchEnd = this.newVersion;
      this.view.flxGo.onClick = this.englishLanguageChange;
      this.view.commonPopup.Buttons.btnSPActionSecondary.onClick = this.updateLater;
      this.view.commonPopups.Buttons.btnSPActionSecondary.onClick = this.openLater;
      // this.view.lblUserIdAlert.setVisibility(false);
      this.view.btnGeneralLogin.onClick = this.showGeneralLogin.bind(this);
      this.view.btnQuickLogin.onClick = this.showQuickLoginPrechecks;
      this.view.HelpLine.imgLocation.onTouchEnd = this.branchandATM;
      this.view.HelpLine1.imgLocation.onTouchEnd = this.branchandATM;
      this.view.btnApplyForOnlineBanking.onClick = this.resetPassword;
      this.view.txtBoxDebitAmount.onTextChange=this.getTrialCalculationCall;
      this.view.lblDateTime.text="更新時間: "+CommonUtilities.currentDateTime();
      this.view.imgRefresh.onTouchStart= function(){
        scope.getExchangeRateServiceCall();
        scope.view.lblDateTime.text="更新時間: "+CommonUtilities.currentDateTime();      
      };
      this.view.toolbarList.flxToolbarList1.onClick=this.navToForeignCurrencyExchangeRate;
      this.view.PrimaryButton.btnSPActionPrimary.onClick=this.closeExchange;
      this.view.imgExchange.onTouchStart=this.swapCurrency;
      this.view.HelpLine.flxGlobe.onClick = this.exchangeRateOpen;
      this.view.HelpLine1.flxGlobe.onClick = this.exchangeRateOpen;
      this.view.imgCloseExchange.onTouchStart = this.closeExchange;
      this.view.toolbarList.flxToolbarList4.onClick = this.trialCalculation;
      this.view.imgCloseTrialCalc.onTouchStart = this.closeTrialcal;
      this.view.flxBuckleBox.onClick = this.showInUseCurrency;
      this.view.flxConvertibleBox.onClick = this.showConversionCurrency;
      this.view.btnEditCurrency.onClick = this.navToEditCommonCurrency;
      this.view.flxEditCurrency.onClick = this.navToEditCommonCurrency;
      this.view.SelectCountry.imgCancel.onTouchStart = this.closeSearch;
      this.view.segExchangeRateTable.onRowClick = this.showSelectedExchangeRateChart;
      this.view.toolbarList.flxToolbarList2.onClick = this.navToWingFungExchangeRate;
      this.view.toolbarList.flxToolbarList3.onClick = this.navToGoldQuotes;
      this.view.flxReload.onClick = this.getExchangeRateServiceCall;
      this.view.btnLogin.onClick = this.usrPwValidation;
      this.checkScreenshotPopup();
      this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.onTouchEnd=this.closeWrongUserCodePopup;
      this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.onTouchEnd=this.navToPasswordReset;
      this.view.downtimeAnnouncementPopup.PrimarySecondaryButtons.SecondryButton.btnSPActionSecondary.onClick = this.closeDowntimePopup.bind(this);
      this.view.downtimeAnnouncementPopup.PrimarySecondaryButtons.PrimaryButton.btnSPActionPrimary.onClick = this.outageServiceNextDay.bind(this);

      this.view.rTextBeforeLoggingIn.onClick = this.CDIStart.bind(this, "https://bank.sinopac.com/sinopacBT/footer/privacy-statement.html");
      this.view.btnOpenDAWHOOnline.onClick = this.customerService.bind(this, "https://dawho.tw/how/apply/");
      this.view.HelpLine.flxMike.onClick = this.navToCardLessWithdrawal;
      this.view.HelpLine1.flxMike.onClick = this.navToCardLessWithdrawal;
      this.view.flxCDICFooter.onClick = this.CDIStart.bind(this,"https://www.cdic.gov.tw/main_ch/chinese.html");
      this.view.LoginHeader.imgQRCode.onTouchStart = this.scanQR.bind(this);
      this.view.flxCDI.setVisibility(false);   
      //       this.view.rTextBeforeLoggingIn.onClick=this.CDIStart.bind(this,"https://m.sinopac.com/MMA8/mobile/official/#/infosecurity/214");
      this.view.passwordExpire.Buttons.btnSPActionPrimary.onTouchEnd=this.closePasswordExpire;
      this.view.commonPopupPointsDesc.Buttons.btnSPActionPrimary.onTouchEnd=this.closeSuspension;
      this.view.commonPopup.imgHeadingIcon.width="42dp";
      this.view.commonPopup.imgHeadingIcon.height="48dp";
      this.view.commonPopup.lblHeading.skin="sknLblSPNSMedium24242416px";
      this.view.commonPopup.lblDescription.skin="sknLblSPNS4A4A4A12px";
      this.view.commonPopup.Buttons.btnSPActionSecondary.skin="sknBtnSecondarySP";
      this.view.commonPopup.Buttons.btnSPActionPrimary.skin="sknBtnPrimarySP";
      this.getChatService();
      /*  this.view.CustomBrowser.browserWebContent.requestURLConfig =
        {URL: "https://m.sinopac.com/m/m_home.aspx",
         requestMethod:constants.BROWSER_REQUEST_METHOD_GET};*/

    },
    closePasswordExpire: function(){
      this.view.flxPasswordLetterExpire.setVisibility(false);
    },
    closeSuspension:function(){
      this.view.flxSuspensionofBankingMembers.setVisibility(false);
      this.view.flxPopups.setVisibility(false);
    },
    navToEditCommonCurrency: function(){
      var navManager = applicationManager.getNavigationManager();
      navManager.setCustomInfo("frmExchangeRate",this.currencydata);
      //navManager.setCustomInfo("userFavCurrencyDetails",this.userFavCurrencyDetails);
      navManager.setCustomInfo("editCommonCurrency", "fromPrelogin");
      var dashBoardScreen={appName: "ForeignExchangeMA",
                           friendlyName: "ForeignExchangeUIModule/frmEditCommonCurrency"
                          }; 
      navManager.setCustomInfo("dashBoardScreen", dashBoardScreen);
      this.closeExchange();
    },

    getPreLoginSystemConfig: function(){

      var authUIModule = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"AuthUIModule"});

      authUIModule.presentationController.fetchPreLoginSystemConfigurations();

    },
    callCustomerDeviceDetails:function(){
      var navManager = applicationManager.getNavigationManager();
      var cred = {
        "identifier": "Login_Cred"
      };
      var Customer_id = kony.keychain.retrieve(cred);
      if(Customer_id.securedata!== undefined && Customer_id.securedata!== null && Customer_id.securedata!== "") {	  
        Customer_id = Customer_id.securedata;
        var params = {
          "id": CommonUtilities.getDeviceID(),
          "Customer_id": Customer_id
        };
        var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"TermsAndConditionsUIModule"});
        AppGroup.presentationController.getCustomerDeviceDetails(params);
      }
      else {
        this.showFastLoginDisabled();
      }
    },
    noticeLink:function(URL){
      kony.application.openURL(URL);
    },

    scanQR: function(){

      if(kony.os.deviceInfo().name === "iPhone"){
        //         var navManager = applicationManager.getNavigationManager();
        //         navManager.navigateTo({appName: 'UnifiedTransferMA', friendlyName: 'frmMyAccountQRCode'});
        var mainCl = objc.import("ScannerNavViewController");
        var app=objc.import("UIApplication");
        var mainObj = mainCl.alloc().jsinit();
        mainObj.showQRScannerView(this.qrSuccessCB);
        //         var nav = objc.import("UIViewController");
        //         nav.setModalPresentationStyle = UIModalPresentationFullScreen;
        //or .overFullScreen for transparency

        app.sharedApplication().keyWindow.rootViewController.presentViewControllerAnimatedCompletion(mainObj, true, null);

      }else{
        var QRInvoke= java.import('com.sinopac.qrscankotlin.KonyWrapper');
        QRInvoke.callBackFromMain(this.getQRScreenResult);
      }
      //     var QRInvoke= java.import('com.sinopac.qrscankotlin.qrScanner');
      //       QRInvoke.callQRScan(this.getResult);
    },

    qrSuccessCB: function(resultString){
      var app=objc.import("UIApplication");
      app.sharedApplication().keyWindow.rootViewController.dismissViewControllerAnimatedCompletion(true, null);

      kony.print("ResultString -- ", resultString);
      //alert("ResultString " +resultString );

      if(resultString==="showMyAccountAction"){
        this.myAccountQR();
      }
      else if(resultString==="Support cross-bank transfer"){
        this.bankList();
      }
      else{
        var decodeURL = decodeURIComponent(resultString);
        //alert(decodeURL);
        //this.checkQRCodecall(decodeURL);
      }
    },

    testConn: function(){
      var mainCl = objc.import("ViewController");
      var mainObj = mainCl.alloc().jsinit();
      var ret = mainObj.TestConnection();
      //alert(ret);
    },

    getQRScreenResult:function(res){
      var scope = this;
      res = JSON.parse(res);
      if(res.result === "myAccountQRClicked"){
        scope.myAccountQR();
      }else if(res.result === "BankListClicked"){
        scope.bankList();
      }else if(res.type === "scanImage"){
        var decodeURL = decodeURIComponent(res.result);
        scope.navToCheckQR(decodeURL);
        //this.checkQRCodecall(decodeURL);
      }
    },

    navToCheckQR: function(decodeURL){
      var navManager = applicationManager.getNavigationManager();
      var dashBoardScreen={appName: 'UnifiedTransferMA', friendlyName: 'TransfersUIModule/frmMyAccountQRCode'};
      navManager.setCustomInfo("dashBoardScreen", dashBoardScreen);
      navManager.setCustomInfo("decodeURL", decodeURL);
    },
    myAccountQR: function(){
      var navManager = applicationManager.getNavigationManager();
      var dashBoardScreen={appName: 'UnifiedTransferMA', friendlyName: 'TransfersUIModule/frmMyAccountQRCode'};
      navManager.setCustomInfo("dashBoardScreen", dashBoardScreen);
    },

    bankList: function(){
      var navManager = applicationManager.getNavigationManager();
      var dashBoardScreen={appName: 'UnifiedTransferMA', friendlyName: 'TransfersUIModule/frmSupportBankList'};
      navManager.setCustomInfo("dashBoardScreen", dashBoardScreen);
    },
    getChatService: function(){
      var self = this;
      KNYMobileFabric.getConfigurationService().getAllClientAppProperties(function(response) {
        self.clientApp = response;
        self.view.LoginHeader.imgHelpLine.onTouchStart = self.customerService.bind(this, response.SPH_CHAT_BOT + "?kid=1990011&q=mobile_login&site=mobile");
        kony.print("client key value pairs retrieved: " + JSON.stringify(response));

      }, function(error) {
        kony.print(" Failed to retrieve client key value pairs: " + JSON.stringify(error));
      });
    },
    customerService: function(URL){
      var self = this;
      this.view.flxLoadingWhiteScreen.setVisibility(true);
      applicationManager.getPresentationUtility().showLoadingScreen();
      this.view.flxPopups.setVisibility(true);
      this.view.flxCustomBrowser.setVisibility(true);
      this.view.CustomBrowser.browserWebContent.enableParentScrollingWhenReachToBoundaries = false;
      this.view.CustomBrowser.browserWebContent.requestURLConfig =
        {URL: URL,
         requestMethod:constants.BROWSER_REQUEST_METHOD_GET};
      this.view.CustomBrowser.flxBack.onClick = function(){
        self.view.flxPopups.setVisibility(false);
        self.view.flxCustomBrowser.setVisibility(false);
      };
      this.view.CustomBrowser.browserWebContent.onSuccess = function(){
        self.disableScreen();
      }
    },
    scheduleTimer: function(){  
      var self = this;
      var timerID =  kony.timer.schedule("timerid1", self.disableScreen, 5, false);
    },
    disableScreen: function(){
      applicationManager.getPresentationUtility().dismissLoadingScreen();
      this.view.flxLoadingWhiteScreen.setVisibility(false);
    },
    navToCardLessWithdrawal: function(){
      var navManager = applicationManager.getNavigationManager();
      var dashBoardScreen={appName: "DigitalTransferMA",
                           friendlyName: "CardlessWithdrawUIModule/frmCardlessWDIntroduction"
                          };
      //navManager.navigateTo(formId);
      navManager.setCustomInfo("dashBoardScreen", dashBoardScreen);
    },
    CDIStart: function(URL){
      var self = this;
      this.view.flxPopups.setVisibility(true);
      this.view.flxCDI.setVisibility(true);
      this.view.btnCDIGo.onClick = function(){
        try{
          kony.application.openURL(URL);
        }catch(ex){
          kony.print("Page not available");
        }
        self.view.flxPopups.setVisibility(false);
        self.view.flxCDI.setVisibility(false);  
      };
      this.view.btnCDICancel.onClick = function(){
        self.view.flxPopups.setVisibility(false);
        self.view.flxCDI.setVisibility(false);        
      };
    },
    onDeviceBackCallback: function(){
    },
    nativePattern: function(parentView){
      if(kony.os.deviceInfo().name !== "android"){
        kony.runOnMainThread(this.mainthread,[]);
      }else{
        this.addNativeWebView(parentView);
      }
    },
    mainthread: function() {
      this.view.nativeLogin.left = "0dp";
      //alert("Running On Main Thread");
      var scannerObj1 = objc.import('SPPatternLockView');
      kony.print("------scanner1---------"+scannerObj1);
      scannerObj2 = scannerObj1.alloc().jsinit();
      kony.print("------scanner2---------"+scannerObj2);
      scannerObj2.configureLoginFlow(this.patternSuccessCB.bind(this));
      this.view.nativeLogin.onViewDidAppear = this.viewDidAppearCallback;
    },
    viewDidAppearCallback: function(eventobject){
      //alert("callback");
      eventobject.addSubview(scannerObj2);
    },
    patternSuccessCB: function(result, pattern){
      //alert("result "+result+"-----"+pattern);
      if(result==="success"){
        var navManager = applicationManager.getNavigationManager();
        navManager.setCustomInfo("loginFlow", "graphicFlow");
        graphicPasswrd = pattern;
        //applicationManager.getPresentationUtility().showLoadingScreen();
        kony.application.showLoadingScreen("slFbox","加載中...",constants.LOADING_SCREEN_POSITION_ONLY_CENTER, false,true,{enableMenuKey:true, enableBackKey:true, progressIndicatorColor : "ffffff77"});
        this.JBRootCheck();
      }
    },
    addNativeWebView: function(parentView){
      try {
        this.view.nativeLogin.left = "8dp";
        var test3="konyim2";
        this.KonyMain = java.import("com.konylabs.android.KonyMain");
        this.konyContext = this.KonyMain.getActivityContext();
        var nativeview = java.import("com.sinopac.graphic.GraphicLoginFragment");
        nativeview.callBackFromMain(this.getResult);
        //GraphicLoginFragment is the fragment which created in the android native application
        var nativeviewobj = new nativeview();
        this.layoutView = java.import("android.widget.LinearLayout");
        this.viewGroup = java.import("android.view.ViewGroup");
        this.linearLayout = new this.layoutView(this.konyContext);
        this.linearLayout.setLayoutParams(new this.viewGroup.LayoutParams( this.viewGroup.LayoutParams.MATCH_PARENT, this.viewGroup.LayoutParams.MATCH_PARENT));
        this.linearLayout.setId(1234);
        parentView.setId(123453);
        var fragmentTransaction = java.import("androidx.fragment.app.FragmentTransaction");
        var fm = this.konyContext.getSupportFragmentManager();
        var ft = fm.beginTransaction();
        ft.add(parentView.getId(),nativeviewobj,"123");
        /*ft.replace(parentView.getId(), nativeviewobj);
        ft.addToBackStack(null);*/
        ft.commit();
      }
      catch (e) { 
        throw new Error("Exception in Scanning the code :" + e);
      } 
    },
    getResult: function(res){
      var loginData=JSON.parse(res);
      //alert(loginData);
      if(loginData.flag==="success"){
        var navManager = applicationManager.getNavigationManager();
        navManager.setCustomInfo("loginFlow", "graphicFlow");
        graphicPasswrd = loginData.result;
        //applicationManager.getPresentationUtility().showLoadingScreen();
        kony.application.showLoadingScreen("slFbox","加載中...",constants.LOADING_SCREEN_POSITION_ONLY_CENTER, false,true,{enableMenuKey:true, enableBackKey:true, progressIndicatorColor : "ffffff77"});
        this.JBRootCheck();
      }
    },
    verifyApp: function(){
      try{
        if(kony.os.deviceInfo().name === "android"){
          var konyMain = java.import('com.konylabs.android.KonyMain');
          var context = konyMain.getActivityContext();
          var windowManager = java.import('android.view.WindowManager');

          var installFromPlayStore = java.import('com.example.googleplaycheck.KonyWrapper');
          var result = installFromPlayStore.getContext(context);
          if(result === true){ //for now set it to true becz of continuity
            this.verifyAppStore = true;
            this.view.flxPopups.setVisibility(true);
            this.view.flxVersionUpdate.setVisibility(true);
            this.view.commonPopup.lblHeading.text ="貼心提醒";
            this.view.commonPopup.lblDescription.text ="因偵測到 APP 版本並非自官網授權商店下載，為維護您的交易安全，建議您移除 APP，並使用 Google 官方「Play 商店」安裝永豐行動銀行，謝謝。";
            this.view.commonPopup.Buttons.btnSPActionPrimary.text ="確定";
          }else{
            this.view.flxMain.setVisibility(false);
            //  var navManager = applicationManager.getNavigationManager();
            // navManager.navigateTo("frmDiscover");
            var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"TermsAndConditionsUIModule"});
            AppGroup.presentationController.getCampaigns();
            //   var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModule"});
            // AppGroup.presentationController.customerDeviceGet();
            this.campaign = true;

          }
        }
        else{
          this.view.flxMain.setVisibility(false);
          //  var navManager = applicationManager.getNavigationManager();
          // navManager.navigateTo("frmDiscover");
          var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"TermsAndConditionsUIModule"});
          AppGroup.presentationController.getCampaigns();
          //   var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModule"});
          // AppGroup.presentationController.customerDeviceGet();
          this.campaign = true;

        }
      }catch(e){
      }
    },
    outageMessage: function(viewModel){
      if(viewModel.serviceData.records.length === 0){
        // this.JBRootCheck();
      }else{
        this.view.downtimeAnnouncementPopup.lblDescription = viewModel.message;
        var starttime = new Date(viewModel.serviceData.records[0].startTime); //Tue Jul 18 2023 05:15:00 GMT+0530 (India Standard Time)
        var endTime = new Date(viewModel.serviceData.records[0].endTime);  //Mon Jul 31 2023 06:20:00 GMT+0530 (India Standard Time)
        var options = {year: 'numeric', month: 'long', weekday: 'long',day: 'numeric' };
        var sDate = starttime;
        var currentDate = sDate.setDate(sDate.getDate()-2); //1689464700000
        var sd = new Date(sDate.toLocaleDateString()); //(start date(from response) - 2) //Sun Jul 16 2023 00:00:00 GMT+0530 (India Standard Time)
        var today = new Date();
        var td = new Date(today.toLocaleDateString()); //todays Date(currentDate)  //Thu Jul 20 2023 00:00:00 GMT+0530 (India Standard Time)
        var todayDate = td.getDate();
        var startDate = starttime.getDate();
        var sm = applicationManager.getStorageManager();
        if(sm.getStoredItem("setValue") === undefined || sm.getStoredItem("setValue") ===null){  //first time check
          var setValue = {
            "count" : todayDate-startDate,
            "currDayUpdate" : false
          };
          sm.setStoredItem("setValue", setValue);
          var setValue=sm.getStoredItem("setValue"); 
        }
        if(startDate>todayDate){ 
          if(sm.getStoredItem("setValue").count === -2){
            sm.getStoredItem("setValue").currDayUpdate = false;
          }else{
            sm.getStoredItem("setValue").currDayUpdate = true;
          }
        }
        if(startDate<=todayDate && todayDate-startDate==sm.getStoredItem("setValue").count){ 
          sm.getStoredItem("setValue").currDayUpdate = false;
        }
        if(todayDate - endTime === 0){
          sm.getStoredItem("setValue").count = todayDate-startDate; 
          sm.getStoredItem("setValue").currDayUpdate = false;
        }
        if(todayDate - endTime>0){
          sm.getStoredItem("setValue").currDayUpdate = true;
        }
        if(!(sm.getStoredItem("setValue").currDayUpdate)){
          this.outage = true;
          this.view.flxOutageContent.setVisibility(true);
          if(starttime.toDateString() === endTime.toDateString()){ //if start and endDate are same
            var today  = new Date(starttime);
            var localDate = today.toLocaleDateString("en-US", options); // Saturday, September 17, 2016
            var getStartTimeHM = starttime.getHours().toString().padStart(2, '0') + ":" + starttime.getMinutes();
            var getEndTimeHM = endTime.getHours().toString().padStart(2, '0') + ":" + endTime.getMinutes();
            this.view.downtimeAnnouncementPopup.lblDateAndTimeValue = localDate + getStartTimeHM + "~" + getEndTimeHM;
          }else{ //if start and endDate are different
            var startDate  = new Date(starttime);
            var localDateStart = startDate.toLocaleDateString("en-US", options); // Saturday, September 17, 2016
            var endDate = new Date(endTime);
            var localDateEnd = endDate.toLocaleDateString("en-US", options); // Saturday, September 17, 2016
            var getStartTimeHM = starttime.getHours().toString().padStart(2, '0') + ":" + starttime.getMinutes();
            var getEndTimeHM = endTime.getHours().toString().padStart(2, '0') + ":" + endTime.getMinutes();
            //this.view.downtimeAnnouncementPopup.flxPopupInner.centerY = "40%";
            //this.view.downtimeAnnouncementPopup.lblDateAndTimeValue.width = "75%";
            this.view.downtimeAnnouncementPopup.lblDateAndTimeValue.text = localDateStart+" "+ localDateEnd+ " "  + getStartTimeHM + "~" + getEndTimeHM;
          }
        }
      }

    },
    outageServiceNextDay: function(){
      var sm = applicationManager.getStorageManager();
      var setValue=sm.getStoredItem("setValue"); 
      setValue.currDayUpdate=true;
      setValue.count = setValue.count+1;
      sm.setStoredItem("setValue", setValue);
      this.view.flxOutageContent.setVisibility(false);
      this.view.flxMain.setVisibility(true);
      kony.application.exit();
    },
    closeDowntimePopup: function(){
      this.view.flxOutageContent.setVisibility(false);
      this.view.flxMain.setVisibility(true);
      if(this.outage === true){
        // this.JBRootCheck();
        this.outage = false;
      }
    },
    cameraAccess:function(){
      var self = this;
      var options = {
        isAccessModeAlways: true
      }; 
      var result = kony.application.checkPermission(kony.os.RESOURCE_CAMERA, options);
      if (result.status === kony.application.PERMISSION_GRANTED) {
      }
      else{
        kony.application.requestPermission(kony.os.RESOURCE_CAMERA, self.permissionStatusCallback);
      }
    },
    permissionStatusCallback: function(response) {
      var self = this;
      var sm = applicationManager.getStorageManager();
      if (response.status === kony.application.PERMISSION_GRANTED) {
        cameraStatus = true;
        sm.setStoredItem("cameraStatus", cameraStatus);
      }
      else{
        cameraStatus = false;
        sm.setStoredItem("cameraStatus", cameraStatus);
      }
    },

    login: function() {
      //applicationManager.getPresentationUtility().showLoadingScreen();
      //    kony.application.showLoadingScreen("slFbox","加載中...",constants.
      //                                          LOADING_SCREEN_POSITION_ONLY_CENTER, false,true,{enableMenuKey:true, 
      //                                                                                           enableBackKey:true, progressIndicatorColor : "ffffff77"});
      const scopeObj = this;
      var encryptedObj = "";
      let authParams = {};
      var navManager = applicationManager.getNavigationManager();
      var type = navManager.getCustomInfo("loginFlow");
      var deviceInfo = kony.os.deviceInfo();
      if(type !== undefined && type !== null && type !== "" && type === "graphicFlow"){
        var certString=navManager.getCustomInfo("certString");
        kony.print("---"+certString);
        certString = certString.replace("BEGIN CERTIFICATE","");
        certString = certString.replace("END CERTIFICATE","");
        certString = certString.replaceAll("-","");
        kony.print("----"+certString);
        encryptedObj=CommonUtilities.getEncryptionValue("",graphicPasswrd,certString);
        authParams = {
          "CustomerID": customerID,
          "EncryptedGraphicCode": encryptedObj.encryptPassCode,
          "LOGINTYPE": "Fast",
          "OS": deviceInfo.name,
          "DEVICE": deviceInfo.model,
          "BROWSER": deviceInfo.category,
          "SOURCE": "MAPP",
          "USERAGENT": kony.os.userAgent(),
          "COUNTRY": "TW",
          "PORT": "59387",
          "loginOptions": {
            "isSSOEnabled": true
          }
        };
      } else if(type !== undefined && type !== null && type !== "" && type === "biometricFlow"){
        authParams = {
          "CustomerID": customerID,
          "qrid": this.fidoAuthenticationDetails.FidoBiometrics[0].qrid,
          "LOGINTYPE": "Biometric",
          "OS": deviceInfo.name,
          "DEVICE": deviceInfo.model,
          "BROWSER": deviceInfo.category,
          "SOURCE": "MAPP",
          "USERAGENT": kony.os.userAgent(),
          "COUNTRY": "TW",
          "PORT": "59387",
          "loginOptions": {
            "isSSOEnabled": true
          }
        };
      } else{
        authParams = {
          "CustomerID": customerID,
          "data": encryptedUsername,
          "data_pwd": encryptedPassword,
          "LOGINTYPE": "Regular",
          "OS": deviceInfo.name,
          "DEVICE": deviceInfo.model,
          "BROWSER": deviceInfo.category,
          "SOURCE": "MAPP",
          "USERAGENT": kony.os.userAgent(),
          "COUNTRY": "TW",
          "PORT": "59387",
          "loginOptions": {
            "isSSOEnabled": true
          }
        };
      }
      let identityServiceName = "SinopacUserLogin";
      this.LoginDAO(authParams, scopeObj.onLoginSuccessCallback, scopeObj.onLoginFailureCallback, identityServiceName);
    },

    LoginDAO : function(authParams, presentationSuccess, presentationError, identityServiceName){    
      let authClient = KNYMobileFabric.getIdentityService(identityServiceName);
      function successCallback(resSuccess){
        presentationSuccess(resSuccess);
      }
      function errorCallback(resError){
        var srh = applicationManager.getServiceResponseHandler();
        var res  = srh.manageLoginResponse(resError);
        presentationError(res);
      }
      authClient.login(authParams,successCallback,errorCallback);
    },

    onLoginSuccessCallback: function(resSuccess){
      applicationManager.getPresentationUtility().showLoadingScreen();
      let params = kony.sdk.getCurrentInstance().tokens['SinopacUserLogin'].provider_token.params;
      isPwChangeRequired = params.user_attributes.is_pw_change_required;

      if (params) {
        let opstatus = params.opstatus;
        let httpStatusCode = params.httpStatusCode;
        if (opstatus === 0 && httpStatusCode === 200) {
          var authUIModule = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"AuthUIModule"});
          authUIModule.presentationController.fetchSystemConfigurations();
          this.precheckCalls();
          this.postLoginService(customerID);
          kony.application.dismissLoadingScreen();
        }
      }
    },

    onLoginFailureCallback: function(resError) {
      var navManager = applicationManager.getNavigationManager();
      var type = navManager.getCustomInfo("loginFlow");
      var errcode = resError.errmsg.serverErrorRes.errcode;
      var errmsg = resError.errmsg.serverErrorRes.errmsg;
      if(type !== undefined && type !== null && type !== "" && type === "graphicFlow"){
        kony.application.dismissLoadingScreen();
        if (errcode === 70001 || errcode === 70002 || errcode === 70003 || errcode === 70004) {  //show error text
          var userId = customerID.slice(0,8) +"***";
          this.view.lblPatternPassword.text = "驗證失敗，"+userId;
          this.view.lblPatternPassword.skin = "sknLblSPNSCF020914px";
        }else if (errcode === 70005 || errcode === 70006){  //show max error count reached popup and disable fast login will happen in login java service itself
          this.showQuickLoginErrorPopup(5);
        }else {
          alert(errmsg);
        }
      }else{
        var scope = this;

        if (errcode === 10002) {
          alert(errmsg);
        } else if (errcode === 21001) {
          this.view.flxPopups.setVisibility(true);
          this.view.flxUserCodeErrorPopUp.setVisibility(true);
          this.view.lblErrorCode2.setVisibility(true);
          this.view.lblErrorCode3.setVisibility(true);
          this.view.lblErrorMessageHeader1.text = "使用者代碼錯誤";
          this.view.lblErrorCode1.text = "「使用者代碼錯誤」，請重新輸入！";
          this.view.lblErrorCode2.text = "提醒您，請確認輸入的英文數字組合及英文大小寫是否正確。";
          this.view.lblErrorCode3.text = "如需重設代碼/密碼，請至 MMA 金融交易網或行動銀行點選「申請/啟用/密碼重置」。";
          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.text = "我知道了";
          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.text = "重設代碼/密碼";

          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.onClick = function() {
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };

          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.onClick = function() {
            var navManager = applicationManager.getNavigationManager();
            var formName = {
              appName: "AuthenticationMA",
              friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
            };
            navManager.navigateTo(formName);
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };
        } else if (errcode === 16001) {
          this.view.flxPopups.setVisibility(true);
          this.view.flxUserCodeErrorPopUp.setVisibility(true);
          this.view.lblErrorCode2.setVisibility(true);
          this.view.lblErrorCode3.setVisibility(false);
          this.view.lblErrorMessageHeader1.text = "網路密碼錯誤 1 次";
          this.view.lblErrorCode1.text = "「網路密碼」錯誤 1 次，請注意英文字母大小寫！";
          this.view.lblErrorCode2.text = "提醒您，為保障您的網路交易安全，「網路密碼」連續輸入錯誤五次，本行將暫時停止提供服務，如需重設代碼/密碼，請至 MMA 金融交易網或行動銀行點選「申請/啟用/密碼重置」。";
          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.text = "我知道了";
          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.text = "重設代碼/密碼";

          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.onClick = function() {
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };

          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.onClick = function() {
            var navManager = applicationManager.getNavigationManager();
            var formName = {
              appName: "AuthenticationMA",
              friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
            };
            navManager.navigateTo(formName);
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };
        } else if (errcode === 16002) {
          this.view.flxPopups.setVisibility(true);
          this.view.flxUserCodeErrorPopUp.setVisibility(true);
          this.view.lblErrorCode2.setVisibility(true);
          this.view.lblErrorCode3.setVisibility(false);
          this.view.lblErrorMessageHeader1.text = "網路密碼錯誤 2 次";
          this.view.lblErrorCode1.text = "「網路密碼」錯誤 2 次，請注意英文字母大小寫！";
          this.view.lblErrorCode2.text = "提醒您，為保障您的網路交易安全，「網路密碼」連續輸入錯誤五次，本行將暫時停止提供服務，如需重設代碼/密碼，請至 MMA 金融交易網或行動銀行點選「申請/啟用/密碼重置」。";
          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.text = "我知道了";
          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.text = "重設代碼/密碼";

          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.onClick = function() {
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };

          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.onClick = function() {
            var navManager = applicationManager.getNavigationManager();
            var formName = {
              appName: "AuthenticationMA",
              friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
            };
            navManager.navigateTo(formName);
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };
        } else if (errcode === 16003) {
          this.view.flxPopups.setVisibility(true);
          this.view.flxUserCodeErrorPopUp.setVisibility(true);
          this.view.lblErrorCode2.setVisibility(true);
          this.view.lblErrorCode3.setVisibility(false);
          this.view.lblErrorMessageHeader1.text = "網路密碼錯誤 3 次";
          this.view.lblErrorCode1.text = "「網路密碼」錯誤 3 次，請注意英文字母大小寫！";
          this.view.lblErrorCode2.text = "提醒您，為保障您的網路交易安全，「網路密碼」連續輸入錯誤五次，本行將暫時停止提供服務，如需重設代碼/密碼，請至 MMA 金融交易網或行動銀行點選「申請/啟用/密碼重置」。";
          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.text = "我知道了";
          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.text = "重設代碼/密碼";

          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.onClick = function() {
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };

          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.onClick = function() {
            var navManager = applicationManager.getNavigationManager();
            var formName = {
              appName: "AuthenticationMA",
              friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
            };
            navManager.navigateTo(formName);
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };
        } else if (errcode === 16004) {
          this.view.flxPopups.setVisibility(true);
          this.view.flxUserCodeErrorPopUp.setVisibility(true);
          this.view.lblErrorCode2.setVisibility(true);
          this.view.lblErrorCode3.setVisibility(false);
          this.view.lblErrorMessageHeader1.text = "網路密碼錯誤 4 次";
          this.view.lblErrorCode1.text = "「網路密碼」錯誤 4 次，請注意英文字母大小寫！";
          this.view.lblErrorCode2.text = "提醒您，為保障您的網路交易安全，「網路密碼」連續輸入錯誤五次，本行將暫時停止提供服務，如需重設代碼/密碼，請至 MMA 金融交易網或行動銀行點選「申請/啟用/密碼重置」。";
          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.text = "我知道了";
          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.text = "重設代碼/密碼";

          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.onClick = function() {
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };

          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.onClick = function() {
            var navManager = applicationManager.getNavigationManager();
            var formName = {
              appName: "AuthenticationMA",
              friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
            };
            navManager.navigateTo(formName);
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };
        } else if (errcode === 16005) {			
          this.view.flxPopups.setVisibility(true);
          this.view.flxUserCodeErrorPopUp.setVisibility(true);
          this.view.lblErrorCode2.setVisibility(true);
          this.view.lblErrorCode3.setVisibility(false);
          this.view.flxBulletGroup.setVisibility(true);
          this.view.lblErrorMessageHeader1.text = "網路密碼錯誤5次";
          this.view.lblErrorCode1.text = "您的「網路密碼」已連續錯誤5次，為確保交易安全，系統已暫停您的使用權限。";
          this.view.lblErrorCode2.text = "如欲恢復網路銀行服務，可使用下列方式申請辦理：";
          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.text = "我知道了";
          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.text = "重設代碼/密碼";
          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.onClick = function() {
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };
          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.onClick = function() {
            var navManager = applicationManager.getNavigationManager();
            var formName = {
              appName: "AuthenticationMA",
              friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
            };
            navManager.navigateTo(formName);
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };
        } else if (errcode === 16006) {

          this.view.flxPopups.setVisibility(true);
          this.view.flxUserCodeErrorPopUp.setVisibility(true);
          this.view.lblErrorCode2.setVisibility(true);
          this.view.lblErrorCode3.setVisibility(false);
          this.view.flxBulletGroup.setVisibility(true);
          this.view.lblErrorMessageHeader1.text = "網路密碼錯誤5次(含以上)";
          this.view.lblErrorCode1.text = "您的「網路密碼」已連續錯誤5次，為確保交易安全，系統已暫停您的使用權限。";
          this.view.lblErrorCode2.text = "如欲恢復網路銀行服務，可使用下列方式申請辦理：";
          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.text = "我知道了";
          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.text = "重設代碼/密碼";
          this.view.PrimarySecondaryButtons2.PrimaryButton.btnSPActionPrimary.onClick = function() {
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };
          this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.onClick = function() {
            var navManager = applicationManager.getNavigationManager();
            var formName = {
              appName: "AuthenticationMA",
              friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
            };
            navManager.navigateTo(formName);
            scope.view.flxPopups.setVisibility(false);
            scope.view.flxUserCodeErrorPopUp.setVisibility(false);
          };
        } else {
          alert(errmsg);
        }
      }
    },
    closeWrongUserCodePopup:function(){
      this.view.flxPopups.setVisibility(false);
      this.view.flxUserCodeErrorPopUp.setVisibility(false);
    },
    navToPasswordReset:function(){
      var scope = this;
      var navManager = applicationManager.getNavigationManager();
      var formId={appName: "AuthenticationMA",
                  friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
                 };
      navManager.navigateTo(formId);
      scope.closeWrongUserCodePopup();// to make sure that popup is closed when navigating to next screen
    },
    postLoginService: function(customerID){
      var request = {
        "id": customerID
      };
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"AuthUIModule"});
      AppGroup.presentationController.postLoginServiceCall(request);
    },   
    setPostLoginSessionContent: function(response){
      var scope = this;
      var client = kony.sdk.getCurrentInstance();
      var configurationSvc = client.getConfigurationService();
      configurationSvc.getAllClientAppProperties(function(response) {
        scope.SessionManager.setClientAppProperty(response);
        kony.print("client key value pairs retrieved: " + JSON.stringify(response));
      }, function(error) {
        kony.print(" Failed to retrieve client key value pairs: " + JSON.stringify(error));
      });
      this.SessionManager.setCustomerID(customerID);
      this.SessionManager.setUserStatus(JSON.parse(response.UserStatus).USER_STATUS[0]);
      this.SessionManager.setUserProfile(JSON.parse(response.UserProfile).USER_PROFILE);
      this.SessionManager.setMemberDetails(JSON.parse(response.memberDetails));
      this.SessionManager.setUserInfo(JSON.parse(response.UserTable).USER[0]);
      var membershipType = JSON.parse(response.UserStatus).USER_STATUS[0].CPRTCD;
      if(membershipType === "1" || membershipType === "3" || membershipType === "6") {
        if(response.IC0001.length!==0){
		  var ic0001Resp = JSON.parse(response.IC0001).body;
          this.SessionManager.setIC0001Details(JSON.parse(response.IC0001).body);
		  this.checkContactInfo(ic0001Resp);
        }
        let object =JSON.parse(response.EC0001);
        for (let property in object) {
          object[property] = JSON.parse(object[property]);
        }
        delete object.httpStatusCode;
        delete object.opstatus;
        this.SessionManager.setCustomerAccountDetails(object);
      } 
      else if (membershipType === "8") {
        this.SessionManager.setccCustomerInfo(JSON.parse(response.ccCustomerInfo));
      }

      if (isPwChangeRequired === "true") {
        this.view.pwChangeRequiredPopup.lblHeading.text = "建議變更使用者密碼";
        this.view.pwChangeRequiredPopup.lblDescription.text = "你的使用者密碼已經超過 6 個月沒有變更了 , 為 保障你的交易安全 , 建議立即變更";
        this.view.pwChangeRequiredPopup.Buttons.btnSPActionPrimary.text = "變更密碼";
        this.view.pwChangeRequiredPopup.Buttons.btnSPActionSecondary.text = "沿用舊密碼";
        this.view.pwChangeRequiredPopup.Buttons.btnSPActionPrimary.onClick = this.navigateToPasswordReset;
        this.view.pwChangeRequiredPopup.Buttons.btnSPActionSecondary.onClick = this.closePwChangeRequiredPopup;
        this.view.flxPwChangeRequired.setVisibility(true);
      } else {
		if (isCreditCardCustomer === "No") {
		  this.showUpdateContactInfoPopup();
		} else {
		  this.navigateToDashboard();
		}
      }
    },

    campaignCheck:function(){
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"AuthUIModule"});
      AppGroup.presentationController.getCampaign();
    },
    setCampaign:function(response){
      this.view.flxFirstTimeLaunch.setVisibility(false);
      this.view.flxMain.setVisibility(false);
      this.view.flxAntirusPopup.setVisibility(true);
      var campaign=[];
      for(var i=0;i<response.length;i++){
        var temp={
          "imgAdCampaigns":response[i].imageURL,
          "lblDescriptionHeading":response[i].bannerTitle,
          "rtxDescription":response[i].bannerDescription
        };
        campaign.push(temp);
      }
      this.view.segAntivirus.widgetDataMap={
        "imgAdCampaigns":"imgAdCampaigns",
        "lblDescriptionHeading":"lblDescriptionHeading",
        "rtxDescription":"rtxDescription"
      };
      this.view.segAntivirus.setData(campaign);
      this.view.btnIsee.onTouchEnd=this.callPrivacyPolicy;
    },
    callPrivacyPolicy:function(){
      //alert("antivirus");
      this.view.flxAntirusPopup.setVisibility(false);
      this.view.flxPrivacyPolicy.setVisibility(true);
      this.view.imgInvisibleTick.onTouchEnd=this.setImage;
    },
    setImage:function(){
      if(this.view.imgInvisibleTick.src==="checkbox_on.png")
      {
        this.view.imgInvisibleTick.src="checkbox_off.png";
        this.view.btnAgree.setEnabled(false);
      }
      else 
      {
        this.view.imgInvisibleTick.src="checkbox_on.png";
        this.view.btnAgree.setEnabled(true);
        this.view.btnAgree.onTouchEnd=this.goToLogin;
      }
    },
    goToLoginWithoutTnC:function(){
      try{
        var navManager = applicationManager.getNavigationManager();
        var formName = navManager.getCustomInfo("setDashboardPage");
        if (formName !== null && formName !== undefined && formName !== "") {
          kony.application.showLoadingScreen("slFbox","加載中...",constants.
                                             LOADING_SCREEN_POSITION_ONLY_CENTER, false,true,{enableMenuKey:true, 
                                                                                              enableBackKey:true, progressIndicatorColor : "ffffff77"});
        }
        this.view.btnAgree.setEnabled(true);
        this.view.flxFirstTimeLaunch.setVisibility(false);
        this.view.flxPrivacyPolicy.setVisibility(false);
        this.view.flxMain.setVisibility(true);
        navManager.navigateTo("frmSinoLogin");	      
      }catch(e){
        kony.print("exception goToLoginWithoutTnC frmSinoLoginCont - "+e);
      }
    },
    goToLogin:function(){
      if(this.view.imgInvisibleTick.src==="checkbox_on.png"){

        var navManager = applicationManager.getNavigationManager();
        var formName = navManager.getCustomInfo("setDashboardPage");
        if (formName !== null && formName !== undefined && formName !== "") {
          kony.application.showLoadingScreen("slFbox","加載中...",constants.
                                             LOADING_SCREEN_POSITION_ONLY_CENTER, false,true,{enableMenuKey:true, 
                                                                                              enableBackKey:true, progressIndicatorColor : "ffffff77"});
        }
        this.view.btnAgree.setEnabled(true);
        this.view.flxPrivacyPolicy.setVisibility(false);
        this.view.flxMain.setVisibility(true);
        navManager.navigateTo("frmSinoLogin");
        //this.validateCertificate();
      }
      else if(this.view.imgInvisibleTick.src==="checkbox_off.png")
      {
        this.view.btnAgree.setEnabled(false);
      }
    },
    precheckCalls: function(){
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModule"});
      AppGroup.presentationController.performServiceCallsOnAccountsSuccess();
    },
    JBRootCheck: function(){
      if(kony.os.deviceInfo().name === "android"){
        var isRooted=java.callStaticMethod('sdk.mobilesdk.fido.com.wrapper.KonyWrapper','getIsDeviceRooted');
        if(isRooted === true){
          this.JBRoot = true;
          this.view.flxPopups.setVisibility(true);
          this.view.flxVersionUpdate.setVisibility(true);
          this.view.commonPopup.lblHeading.text ="貼心提醒";
          this.view.commonPopup.lblDescription.text ="偵測到您的裝置有進行 ROOT，為了您的交易安全，請謹慎使用行動銀行，以避免資訊外洩風險。";
          this.view.commonPopup.Buttons.btnSPActionPrimary.text ="確定";
        }else{
          this.view.flxPopups.setVisibility(false);
          this.view.flxVersionUpdate.setVisibility(false);
          this.view.flxMain.setVisibility(true);
          this.checkUSBDebuggedEnabled();
        }
      }else{
        this.view.flxPopups.setVisibility(false);
        this.view.flxVersionUpdate.setVisibility(false);
        this.view.flxMain.setVisibility(true);
        this.checkUSBDebuggedEnabled();
      }
    },
    checkUSBDebuggedEnabled: function(){
      var navManager = applicationManager.getNavigationManager();
      if(kony.os.deviceInfo().name === "android"){
        var isUSBDebug = java.callStaticMethod('com.example.googleplaycheck.KonyWrapper','isBeingDebugged');
        if(isUSBDebug === true){
          this.USB = true;
          this.view.flxPopups.setVisibility(true);
          this.view.flxVersionUpdate.setVisibility(true);
          this.view.commonPopup.lblHeading.text ="貼心提醒";
          this.view.commonPopup.lblDescription.text ="偵測到您的裝置有進行USB偵錯功能，為了您的交易安全，請謹慎使用行動銀行，以避免資訊外洩風險。";
          this.view.commonPopup.Buttons.btnSPActionPrimary.text ="確定";
        }else{
          this.view.flxPopups.setVisibility(false);
          this.view.flxVersionUpdate.setVisibility(false);
          this.view.flxMain.setVisibility(true);
          //         if(this.campaign === true){
          //           this.campaignCheck();
          //           this.campaign = false;
          //         }else{
          //           this.validateCertificate();
          //         }
          this.validateCertificate();
        }
      }
      else{
        this.view.flxPopups.setVisibility(false);
        this.view.flxVersionUpdate.setVisibility(false);
        this.view.flxMain.setVisibility(true);
        //         if(this.campaign === true){
        //           this.campaignCheck();
        //           this.campaign = false;
        //         }else{
        //           this.validateCertificate();
        //         }
        this.validateCertificate();
      }
    },
    checkScreenshotPopup: function(){
      var sm = applicationManager.getStorageManager();
      var cameraStatus=sm.getStoredItem("cameraStatus"); 
      var selectedIndexValue=sm.getStoredItem("selectedIndexValue"); 
      if(cameraStatus=== true || selectedIndexValue ===0) {
        if(selectedIndexValue === 1){
          //code here showpopup
        }
      }
    },
    validateCertificate: function(){
      var request={};
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModule"});
      AppGroup.presentationController.getCertificate(request);
    },
    setCertificate: function(certificate){
      var certString;
      var navManager = applicationManager.getNavigationManager();
      var certificateRecord=certificate.records;
      if(certificateRecord[0].SOFTDECRYPT===false){
        this.getCertificateFromHSM();
      }
      else if(certificateRecord[0].SOFTDECRYPT===true){
        certString=certificateRecord[0].CERTIFICATE;
        navManager.setCustomInfo("certString", certString);
      }
      this.appendCheckCode();
    },
    appendCheckCode: function(){
      var request={
        "CustID": customerID
      };
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModule"});
      AppGroup.presentationController.getCheckCodeCustId(request);
    },
    responseCheckCodeCustId: function(response){
		isCreditCardCustomer = response.isCreditCardCustomer;
	  if (isCreditCardCustomer === "Yes") {
		customerID = response.AppendCheckcodeResult[0].CustomerIdWithCheckcode;
		this.SessionManager.setCustomerIdWithCheckcode(response.AppendCheckcodeResult[0].CustomerIdWithCheckcode);
		this.staffCheck();
	  } else if (isCreditCardCustomer === "No") {
		if (response.AppendCheckcodeResult[0].IsValidCustomerId === "true") {
		  customerID = response.AppendCheckcodeResult[0].CustomerIdWithCheckcode;
		  this.SessionManager.setCustomerIdWithCheckcode(response.AppendCheckcodeResult[0].CustomerIdWithCheckcode);
		  this.SessionManager.setCustomerIdWithoutCheckcode(response.AppendCheckcodeResult[0].CustomerIdWithoutCheckcode);
		  this.SessionManager.setCheckcode(response.AppendCheckcodeResult[0].Checkcode);
		  this.staffCheck();
		} else {
		  alert("The customer ID entered is not valid.");
		}
      } else {
		  alert("The customer ID entered is not valid.");
	  }
    },
    getCertificateFromHSM:function(){
      var request={};
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModule"});
      AppGroup.presentationController.getCertificateHSM(request);
    },
    setCertificateFromHSM:function(certificateHSM){
      var navManager = applicationManager.getNavigationManager();
      if(certificateHSM.code === "0"){ //success
        var certificateValue=certificateHSM.cert;
        certString=certificateValue;
        navManager.setCustomInfo("certString", certString);
      }
    },
    staffCheck:function(){
      var request={};
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModule"});
      AppGroup.presentationController.verifyStaffCheck(request);
    },
    responseStaffCheck: function(staffCodeFlag){
      var bankID=staffCodeFlag.BankIP;
      if(bankID.IsIntraAddress===false)
      {
        this.getWWWValue();
      }
      else{
        this.getWWWValue();
      }
    },
    resetPassStaffCheck:function(staffCodeFlag){
      var bankID=staffCodeFlag.BankIP;
      if(bankID.IsIntraAddress===false)
      {
        var formId={appName: "AuthenticationMA",
                    friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
                   };
        var navManager = applicationManager.getNavigationManager();
        navManager.navigateTo(formId);
      }
      else
      {
        var formId={appName: "AuthenticationMA",
                    friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
                   };
        var navManager = applicationManager.getNavigationManager();
        navManager.navigateTo(formId);
      }
    },

    getWWWValue:function(){
      var request = {
        "CUSTID": customerID
      };
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModule"});
      AppGroup.presentationController.getWWWStatusValue(request);
    },
    checkGroupFeatureAndActions:function(response){
      var id=response.id;
      AppGroup.presentationController.getGroupFeatures(id);
    },
    checkGroupFeatureValue:function(response){
      sessionFeature=response.features;
    },
    checkWWWStatusValue:function(response){
      if(response.records===undefined || response.records===null || response.records.length===0) {
        this.view.commonPopups.lblHeading.setVisibility(false);
        this.view.commonPopups.lblDescription.text = "請確認您輸入的身分證字號是否正確，或是否已申請、取消本行「網路服務」。若您尚未申請本行「網路服務」，持本行存款帳戶或本行信用卡者，請線上申請網銀會員。";
        this.view.commonPopups.Buttons.btnSPActionSecondary.setVisibility(false);
        this.view.commonPopups.Buttons.btnSPActionPrimary.text = "我知道了";
        this.view.commonPopups.Buttons.btnSPActionPrimary.width = "100%";
        this.view.commonPopups.Buttons.btnSPActionPrimary.left = "0%";
        this.view.commonPopups.Buttons.btnSPActionPrimary.onClick = this.closeIncorrectCustIdPopup;
        this.view.flxPopups.setVisibility(true);
        this.view.flxOpenWebVersion.setVisibility(true);
      }
      else if(response.records[0].WWWSTATUS==="1" && response.records[0].TIMEOUTTIME===undefined){
        var formId={appName: "AuthenticationMA",
                    friendlyName: "TermsAndConditionsUIModule/frmPasswordEnable"
                   };
        var navManager = applicationManager.getNavigationManager();
        navManager.setCustomInfo("frmPasswordEnable",customerID);
        navManager.navigateTo(formId);
      }
      else if(response.records[0].WWWSTATUS==="1" && response.records[0].TIMEOUTTIME!==undefined){
        this.view.passwordExpire.lblHeading.text = "輸入錯誤";
        this.view.passwordExpire.lblDescription.setVisibility(false);
        this.view.passwordExpire.rtxDesc.setVisibility(true);
        this.view.passwordExpire.rtxDesc.text = "親愛的客戶 , 您好:<br>由此您已申請永豐銀行密碼啟用服務 , 請透過永豐銀行密碼啟用服務網站 , 啟用MMA金融交易網會員。<br><br>倘有任何疑問 , 請與本行24小時客戶服務專線 02-2505-9999 聯繫 , 將有專人為您服務。";
        this.view.passwordExpire.Buttons.btnSPActionPrimary.text = "回首頁";
        this.view.flxPasswordLetterExpire.setVisibility(true);
      } else if (response.records[0].WWWSTATUS==="2") {
        this.view.passwordExpire.lblHeading.text = "輸入錯誤";
        this.view.passwordExpire.lblDescription.setVisibility(false);
        this.view.passwordExpire.rtxDesc.setVisibility(true);
        this.view.passwordExpire.rtxDesc.text = "親愛的客戶 , 您好:<br>由於您已申請永豐銀行密碼啟用服務 , 請透過網路銀行/行動銀行之臨櫃密碼函啟用服務 , 進行使用者代碼 「與網路密碼設定。<br><br>倘有任何疑問 , 請洽詢客服專線 02-2505-9999。";
        this.view.passwordExpire.Buttons.btnSPActionPrimary.text = "回首頁";
        this.view.flxPasswordLetterExpire.setVisibility(true);
      }
      else if(response.records[0].WWWSTATUS==="3")
      {
        var navManager = applicationManager.getNavigationManager();
        var type = navManager.getCustomInfo("loginFlow");
        if(type !== undefined && type !== null && type !== "" && type === "graphicFlow"){
          this.login();
        }else if(type !== undefined && type !== null && type !== "" && type === "biometricFlow"){
          this.login();
        }else{
          this.usrPwEncryption();
        }
      }
      else if(response.records[0].WWWSTATUS==="5")
      {
        this.view.flxPasswordLetterExpire.setVisibility(true);
      }

      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModule"});
      var role_id={};
      AppGroup.presentationController.getGroupFeaturesAndActions(role_id);
    },

    setCallBacks: function() {
      var callbacksObj = {
        onbackground: this.hideContent,
        onforeground: this.showContent,
      };
      kony.application.setApplicationCallbacks(callbacksObj);
    },
    hideContent: function(){ 
      kWrapper.onPause;
    },
    showContent: function(){
      kWrapper.onResume;
    },
    englishLanguageChange: function(){      
      try{
        kony.application.openURL("https://mma.sinopac.com/MemberPortal/Member/MMALogin_EN.aspx");
      }catch(ex){
        kony.print("language change error");
      }      
      this.view.flxMain.setVisibility(true);
      this.view.flxPopups.setVisibility(false);
      this.view.flxConfirmationMessagesPopup.setVisibility(false);
    },
    showGeneralLogin: function(){
      var navManager =applicationManager.getNavigationManager();
      generalLoginFlag = "GENERAL";
      this.SessionManager.setLoginType(generalLoginFlag);
      navManager.setCustomInfo("generalLoginFlag",generalLoginFlag);
      this.view.flxScrollContent.setVisibility(true);
      this.view.flxActiveLine.skin="sknFlxSPTabSeperatorActive";
      this.view.btnGeneralLogin.skin="sknBtnSPCF020918px";
      this.view.btnGeneralLogin.focusSkin="sknBtnSPCF020918px";
      this.view.flxInActive.skin="sknFlxSPTabSeperatorInactive";
      this.view.btnQuickLogin.skin="sknBtnSP70707018px";
      this.view.btnQuickLogin.focusSkin="sknBtnSP70707018px";
      this.view.flxQuickLoginContent.setVisibility(false);
      this.view.HelpLine.setVisibility(true);
      this.view.HelpLine1.setVisibility(false);
    },
    showQuickLogin: function(){
      var navManager =applicationManager.getNavigationManager();
      generalLoginFlag ="FAST";
      this.SessionManager.setLoginType(generalLoginFlag);
      navManager.setCustomInfo("generalLoginFlag",generalLoginFlag);
      var cred = {
        "identifier": "Login_Cred"
      };
      var data = {
        "identifier": "FastLogin_Cred"
      };
      var Customer_id = kony.keychain.retrieve(cred);
      var flCustomer_id = kony.keychain.retrieve(data);
      if(Customer_id.securedata!== undefined && Customer_id.securedata!== null && Customer_id.securedata!== "" &&
         flCustomer_id.securedata!== undefined && flCustomer_id.securedata!== null && flCustomer_id.securedata!== "") {
        Customer_id = Customer_id.securedata;
        flCustomer_id = flCustomer_id.securedata;
        if(flCustomer_id === Customer_id){
          kony.application.showLoadingScreen("slFbox","加載中...",constants.LOADING_SCREEN_POSITION_ONLY_CENTER, false,true,{enableMenuKey:true, enableBackKey:true, progressIndicatorColor : "ffffff77"});
          var params = {
            "$filter": "CUSTID eq '"+Customer_id+"'"
          };
          var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"TermsAndConditionsUIModule"});
          AppGroup.presentationController.getLoginUserDetails(params);
        } else {
          this.showFastLoginDisabled();
        }
      }
      else {
        this.showFastLoginDisabled();
      }
    },
    setFastLoginOptions: function(response){
      kony.application.dismissLoadingScreen();
      if(response.message === "failure"){
        alert("Service Failed");
      }else{
        var navManager = applicationManager.getNavigationManager();
        navManager.setCustomInfo("deviceBoundDetails", response);
        var deviceBoundStatus = response.deviceBoundStatus;
        if(deviceBoundStatus === "0"){//success flow
          response.customerdevice = JSON.parse(response.customerdevice);
          var bindingType = response.customerdevice[0].BINDINGTYPE;
          this.view.flxFaceLogin.setVisibility(false);
          this.view.flxFingerprintLogin.setVisibility(false);
          this.view.flxIrisLogin.setVisibility(false);
          this.view.flxPatternLogin.setVisibility(false);
          this.view.flxBiometricLogin.setVisibility(false);		  
          this.view.flxScrollContent.setVisibility(false);
          this.view.flxActiveLine.skin="sknFlxSPTabSeperatorInactive";
          this.view.btnGeneralLogin.skin="sknBtnSP70707018px";
          this.view.btnGeneralLogin.focusSkin="sknBtnSP70707018px";
          this.view.flxInActive.skin="sknFlxSPTabSeperatorActive";
          this.view.btnQuickLogin.skin="sknBtnSPCF020918px";
          this.view.btnQuickLogin.focusSkin="sknBtnSPCF020918px";
          this.view.flxQuickLoginContent.setVisibility(true);
          this.view.HelpLine.setVisibility(false);
          this.view.HelpLine1.setVisibility(true);
          var cred = {
            "identifier": "Login_Cred"
          };
          var Customer_id = kony.keychain.retrieve(cred);
          Customer_id = Customer_id.securedata;
          Customer_id=Customer_id;
          this.view.lblBiometricLoginSubHeading.text = Customer_id.slice(0,8) +"***";
          if(bindingType === "F" || bindingType === "T" || bindingType === "I"){ //show face biometric login
            this.view.flxBiometricLogin.setVisibility(true);
          }else if(bindingType === "G"){ //show graphic pattern login
            this.view.lblPatternPassword.text = Customer_id.slice(0,8) +"***";
            this.view.lblPatternPassword.skin = "sknLblSPNS70707016px";
            this.view.flxPatternLogin.setVisibility(true);
          }else if(bindingType === "Q"){ //show QR login
          }else{
            this.showGeneralLogin();
            this.showFastLoginDisabled();
          }
        } else{
          this.showFastLoginDisabled();
        }
      }
    },
    showFastLoginDisabled: function(){
      kony.application.dismissLoadingScreen();
//       this.view.commonPopups.lblHeading.text = "尚未設定快速登入";
      //this.view.commonPopups.lblDescription.text = "你可透過指紋/臉部辨識登入，取代輸入使用者代碼及網路密碼，服務更快、更安全！";
//       this.view.commonPopups.lblDescription.text = "請先以「使用者代碼」、「網銀密碼」登入後再進行設定。透過指紋/臉部辨識登入，服務更快、更安全！";
      this.view.commonPopups.lblHeading.text = "裝置尚未綁定";
      this.view.commonPopups.lblDescription.text = "為保障你的交易安全，請先完成裝置綁定，才能繼續使用相關交易服務。";
      this.view.commonPopups.Buttons.btnSPActionSecondary.text = "先不要"; //don't btn
      this.view.commonPopups.Buttons.btnSPActionSecondary.setVisibility(true);
      this.view.commonPopups.Buttons.btnSPActionSecondary.onClick = this.disablePopup;
      this.view.commonPopups.Buttons.btnSPActionPrimary.text = "立即設定"; //set now btn
      this.view.commonPopups.Buttons.btnSPActionPrimary.width = "48%";	  
      this.view.commonPopups.Buttons.btnSPActionPrimary.left = "4%";
      this.view.commonPopups.Buttons.btnSPActionPrimary.onClick = this.setFastLoginFlow;
      this.view.flxPopups.setVisibility(true);
      this.view.flxOpenWebVersion.setVisibility(true);	  
    },
    showRegularLoginReset: function(){
      kony.application.dismissLoadingScreen();
      this.view.commonPopups.lblHeading.text = "偵測此帳戶的 MMA 使用者 密碼已變更";
      this.view.commonPopups.lblDescription.text = "為維護您的權益，已關閉「該 ID (後 4 碼隱碼)」的快速登入服務。請以 MMA 使用者代碼/密碼進行身分驗證登入後，點開右下角「更多」，再至右上角設定內「快速登入」重新設定快速登入功能。";
      this.view.commonPopups.Buttons.btnSPActionSecondary.setVisibility(false);
      this.view.commonPopups.Buttons.btnSPActionPrimary.text = "確定"; //sure btn
      this.view.commonPopups.Buttons.btnSPActionPrimary.width = "100%";
      this.view.commonPopups.Buttons.btnSPActionPrimary.left = "0%";
      this.view.commonPopups.Buttons.btnSPActionPrimary.onClick = this.disablePopup;
      this.view.flxPopups.setVisibility(true);
      this.view.flxOpenWebVersion.setVisibility(true);	  
    },
    disablePopup: function(){
      var dashBoardScreen = null;	  
      var navManager = applicationManager.getNavigationManager();
      navManager.setCustomInfo("dashBoardScreen", dashBoardScreen);
      this.view.flxPopups.setVisibility(false);
      this.view.flxOpenWebVersion.setVisibility(false);
    },
    setFastLoginFlow: function(){
      var navManager = applicationManager.getNavigationManager();
      this.disablePopup();
      if(this.view.commonPopups.lblHeading.text === "尚未設定快速登入"){
        var dashBoardScreen = {appName: "AuthenticationMA",
                               friendlyName: "frmQuickLoginSetting"
                              };
      }else{
        var dashBoardScreen = null;
      }
      navManager.setCustomInfo("dashBoardScreen", dashBoardScreen);
    },
    maskPassword: function(){
      if( this.view.imgStrikedEyeIcon.src === "union.png"){
        this.view.imgStrikedEyeIcon.src ="eye_icon.png";
        this.view.txtBoxOnlineBankingPasswords.secureTextEntry = false;
      }else{
        this.view.txtBoxOnlineBankingPasswords.secureTextEntry = true;
        this.view.imgStrikedEyeIcon.src = "union.png";
      }
    },
    cardlessWithdrawal: function(){
      var formId={
        appName: "DigitalTransferMA",
        friendlyName:"CardlessWithdrawUIModule/frmCardlessWDIntroduction"
      };
      var navManager= applicationManager.getNavigationManager();
      navManager.navigateTo(formId);
    },
    Back: function(){
      this.view.flxManinIn.setVisibility(false);
      this.view.flxAlert.setVisibility(false);
      this.view.flxMainPopUp.setVisibility(false); 
      this.view.flxMain.setVisibility(true);
    },
    englishVersion: function(){
      this.view.flxMain.setVisibility(true);
      this.view.flxPopups.setVisibility(true);
      this.view.flxConfirmationMessagesPopup.setVisibility(true);
    },
    newVersion: function(){
      this.view.flxMain.setVisibility(false);
      this.view.flxPopups.setVisibility(true);
      this.view.flxVersionUpdate.setVisibility(true);
    },
    openWebVesion: function(){
      this.view.flxVersionUpdate.setVisibility(false);
      this.view.flxOpenWebVersion.setVisibility(true);
    },
    updateLater: function(){
      this.view.flxMain.setVisibility(true);
      this.view.flxVersionUpdate.setVisibility(false);
      this.view.flxPopups.setVisibility(false);
    },
    openLater: function(){
      this.view.flxMain.setVisibility(true);
      this.view.flxOpenWebVersion.setVisibility(false);
      this.view.flxPopups.setVisibility(false);
    },
    mainForm: function(){
      this.view.flxMain.setVisibility(true);
      this.view.flxPopups.setVisibility(false);
      this.view.flxConfirmationMessagesPopup.setVisibility(false);
    },
    alertPopUp: function(){
      var user=this.view.txtBoxUserId.text;
      var passwrd = this.view.txtBoxOnlineBankingPasswords.text;
      var navManager = applicationManager.getNavigationManager();
      generalLoginFlag = "GENERAL";
      this.SessionManager.setLoginType(generalLoginFlag);
      navManager.setCustomInfo("generalLoginFlag",generalLoginFlag);
      var certString=navManager.getCustomInfo("certString");
      certString ="MIIF5jCCA86gAwIBAgIETupN9DANBgkqhkiG9w0BAQsFADBhMQswCQYDVQQGEwJUVzEbMBkGA1UEChMSVEFJV0FOLUNBLkNPTSBJbmMuMRgwFgYDVQQLEw9FdmFsdWF0aW9uIE9ubHkxGzAZBgNVBAMTElRhaUNBIFRlc3QgRlhNTCBDQTAeFw0yMjAzMjkwNzAwMzBaFw0yNDA1MjcxNTU5NTlaMIGQMQswCQYDVQQGEwJUVzEQMA4GA1UEChMHRmluYW5jZTEbMBkGA1UECxMSVGFpQ0EgVGVzdCBGWE1MIENBMSQwIgYDVQQLExs3MDc1OTAyOC1UQUlXQU4tQ0EuQ09NIEluYy4xDTALBgNVBAsTBEZYTUwxHTAbBgNVBAMTFDg2NTE3Mzg0LTAxLTIwNDhURVNUMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu48155g0mwsc+HWBn3xRKVTyq84qBcYtZRqFQTv6v20LJ258Fov2YjvQCX+ryHDx8SdK9YMaY2HH67QBqZGXKW6F/GXUXKUw7ZvJo9DuU7qv4UdskshlTj8FP/yFWFirnbN3P8qxWF3pwdWyqs8HNVmTv7je0M5jq74zi6C/rJ3KghJI+BMIovI7i5oKXWyfjheIG0HziaYmXZ3bf8FvQzI1904vWJ53cmztBhDB72PqN5Q4q9ySjaSncAAuIpZPRlJrYMR1+nWIeMpDlTp5YwP9cXrNfbIXRS1EO+87bKITnW6P0Uhs8bmEzAbuKHJ9GuSv3CiPCfpdT9PDLEMIWwIDAQABo4IBdDCCAXAwKwYDVR0jBCQwIoAgm8uIcpr23Wkc9LbDE0kAd63pTivRe2kUnGaSZ3IlQKwwKQYDVR0OBCIEIFP1TgzUNOp7trmHsrxy+QF45ascVKRybFweVurYuAlnME8GA1UdHwRIMEYwRKBCoECGPmh0dHA6Ly9pdGF4LnR3Y2EuY29tLnR3L3Rlc3RjcmwvVGVzdF9mdWNhX3Jldm9rZV9TaGEyXzIwMjAuY3JsMA0GA1UdEQQGMASBAkBAMDoGCCsGAQUFBwEBBC4wLDAqBggrBgEFBQcwAYYeaHR0cDovL09DU1BfRXZhbC5UYWljYS5jb20udHc6MF8GA1UdIARYMFYwVAYHYIEeAwEIBTBJMCMGCCsGAQUFBwIBFhdodHRwOi8vd3d3LnR3Y2EuY29tLnR3LzAiBggrBgEFBQcCAjAWGhRSZXN0cmljdGlvbiA9MC4yLjMuMTAJBgNVHRMEAjAAMA4GA1UdDwEB/wQEAwIGwDANBgkqhkiG9w0BAQsFAAOCAgEAAHrZrxU7uFZO8wm/rmDSmK9yWVjwhsgCAEzjgUsEB37MGPQkitpUCSbir/La5NhdT1g2YGk51ndtfOXMGUMhWt0EVvTnuuJ5lKaFgCpQpytX0XfLEXrzGuiqZIkEIW3a5RGUX4CpIqaMubuOW+vyaZiM+eCq2RXQZwA8pXmjkQu3UmAjU4mSvCIJp6uGDqDNDSjd0Ldvm9V+MjEakeN+ZmXNzayUyZvBniufU61F3M6JKlr6IaR2VUGv8viJmlF90d/4W5j8Mv8zK8Qgl8sJJybYnDvBsjPiIb5dUv3PkPZff3wNfxKwwhlk7txMQ98usL3bt7dFClfapXVLF4MjOafJJQF/xWYnXd1KiIoWl+rphgSPrSUz6L9DWpSwkYKUhxSaVGc9wNvB7pl7cK9RJ1wETbWotjBa0A2Ylx9MrJ0Iya8DTwlNazJ/oXq8ArR87qhy7JOr65AaYXLEIXl79jlMksOm9wR8zkyhmZLpcx8nnX1MvrRdBaASaedxV0D4U0KXIlMjHJPrd7tH6xoCGFXDIB67KF9TsQ3zIqAsbxdBVUjnY6axRfQCHdD7BQta1VR8Ckwl5Cl10VoN85ColldWkdp4uzb2u75YNjJcciQmPpEK4zHhBa5JzTEmhRZXklo2F6KP1C+4dtMXozdPj0dIbqcYhsIqLIDT38gUCyc=";
      var encryptedValues=CommonUtilities.getEncryptionValue(user,passwrd,certString);     
      var regex = /^([a-zA-Z]){1,19}([0-9]){1,19}$/;
      reg = /^[a-zA-Z0-9*\s]*$/;
      var passwordValidation = (passwrd.match(regex)) ? true : false;
      var usercode = (user.match(regex)) ? true : false;
      var id = (userID.match(reg)) ? true : false;
      if(usercode === false){
        this.view.flxManinIn.setVisibility(false);
        this.view.flxPopups.setVisibility(true); 
        this.view.flxUserCodeErrorPopUp.setVisibility(true);
        this.view.PrimarySecondaryButtons2.SecondryButton.btnSPActionSecondary.onClick = this.showMain;
        return;
      }
      var count=0;
      if(passwordValidation === false){
        count = count+1;
        if(count >= 5){
          this.view.flxManinIn.setVisibility(false);
          this.view.flxPopups.setVisibility(true);
          this.view.flxWrongMessage.setVisibility(true); 
          this.view.flxMainPopUp.setVisibility(true); 
          this.view.PrimarySecondaryButtons1.SecondryButton.btnSPActionSecondary.onClick = this.showMain;
          return;
        }
        else{
          this.view.flxManinIn.setVisibility(false);
          this.view.flxPopups.setVisibility(true); 
          this.view.flxWrongPasswordBelowFiveTime.setVisibility(true);
          this.view.PrimarySecondaryButtons.SecondryButton.btnSPActionSecondary.onClick = this.showMain;
          return;
        }
      }
      if(userID!==null && user!==null && passwrd!==null && user.length >= 6 && user.length <=20 && usercode === true && passwrd.length >= 6 && passwrd.length <=20 && passwordValidation === true && id === true)
      {
        var formName = navManager.getCustomInfo("setDashboardPage");
        var dashBoardScreen=navManager.getCustomInfo("dashBoardScreen");
        if(formName !== null && formName !== undefined && formName !== ""){
          navManager.navigateTo(formName);
        } else if(dashBoardScreen !== null && dashBoardScreen !== undefined && dashBoardScreen !== ""){ 
          navManager.navigateTo(dashBoardScreen);
        } else{
          var formId={appName: "ArrangementsMA",
                      friendlyName: "DepositUIModule/frmHomedptAccount"
                     };
          navManager.setCustomInfo("frmHomedptAccount",customerID);
          navManager.navigateTo(formId,customerID);
        }
      }
    },
    showMain: function(){
      var navManager = applicationManager.getNavigationManager();
      if(this.verifyAppStore === true){
        kony.application.exit();
        this.verifyAppStore = false;
      }else{
        this.view.flxAlert.setVisibility(false);
        this.view.flxMainPopUp.setVisibility(false);
        this.view.flxMain.setVisibility(true);
        this.view.flxManinIn.setVisibility(false);
        this.view.flxPopups.setVisibility(false);
        this.view.flxSuspensionofBankingMembers.setVisibility(false);
        this.view.flxWrongMessage.setVisibility(false);
        this.view.flxWrongPasswordBelowFiveTime.setVisibility(false);
        this.view.flxUserCodeErrorPopUp.setVisibility(false);
        if(this.JBRoot === true){
          this.checkUSBDebuggedEnabled();
          this.JBRoot = false;
        }
        if(this.USB === true){
          var formId={appName: "ArrangementsMA",
                      friendlyName: "DepositUIModule/frmHomedptAccount"
                     };
          navManager.navigateTo(formId);
          this.USB =false;
        }
      }
    },
    showMainScreen: function(){
      this.view.flxManinIn.setVisibility(false);
      this.view.flxMain.setVisibility(true);
      this.view.flxAlert.setVisibility(false);
    },
    showPassword: function(){
      if( this.view.imgStrikedIcon.src === "union.png"){
        this.view.imgStrikedIcon.src ="eye_icon.png";
        this.view.txtBoxUserId.secureTextEntry = false;
      }else{
        this.view.txtBoxUserId.secureTextEntry = true;
        this.view.imgStrikedIcon.src = "union.png";
      }
    },
    showUnCheck: function(){
      var sm = applicationManager.getStorageManager();
      this.view.flxCheckBoxOn.setVisibility(false);
      this.view.flxCheckBoxOff.setVisibility(true);
      var rememberCustID="";
      sm.setStoredItem("rememberCustID",rememberCustID);
    },
    showCheck: function(){
      var sm = applicationManager.getStorageManager();
      this.view.flxCheckBoxOn.setVisibility(true);
      this.view.flxCheckBoxOff.setVisibility(false); 
      var rememberCustID=this.view.txtBoxIdNumber.text;
      sm.setStoredItem("rememberCustID",rememberCustID); 

    },
    validateUserName: function(){
      var userName = this.view.txtBoxUserId.text;
      rege = /^([a-zA-Z]){1,19}([0-9]){1,19}$/;
      if ((userName!=="") && (userName!==null) && (userName!==undefined) && (userName.length >= 6) && (userName.length !==0) && (userName.length <= 20) && ((userName.match(rege))) ) {
        this.view.lblUserIdAlert.setVisibility(false);
        this.view.flxUserId.skin = "sknFlxFFFFFFBGBorderedededRadius4PxSP";
      }
      else if((userName==="") || (userName===null) || (userName===undefined)){
        this.view.lblUserIdAlert.setVisibility(true);
        this.view.flxUserId.skin = "sknFlxCF0209Border";
        this.view.lblUserIdAlert.skin="sknLblSPCF020914px";
        this.view.lblUserIdAlert.text="請輸入";

      }
      else{
        this.view.lblUserIdAlert.setVisibility(true);
        this.view.flxUserId.skin = "sknFlxCF0209Border";
        this.view.lblUserIdAlert.skin="sknLblSPCF020914px";
        this.view.lblUserIdAlert.text="請確認使用者代碼是否正確喔！";

      }
    },
    validatePassword: function(){
      var passwrd = this.view.txtBoxOnlineBankingPasswords.text;

      rege = /^([a-zA-Z]){1,19}([0-9]){1,19}$/;
      if ((passwrd!=="") && (passwrd!==null) && (passwrd!==undefined) && (passwrd.length >= 6) && (passwrd.length!==0) && (passwrd.length <= 20) && ((passwrd.match(rege))) ) {
        this.view.lblOnlineBankingPasswordAlert.setVisibility(false);
        this.view.flxOnlineBankingPasswords.skin = "sknFlxFFFFFFBGBorderedededRadius4PxSP";
      } 
      else if((passwrd==="") || (passwrd===null) || (passwrd===undefined)){
        this.view.lblOnlineBankingPasswordAlert.setVisibility(true);
        this.view.flxOnlineBankingPasswords.skin = "sknFlxCF0209Border";
        this.view.lblOnlineBankingPasswordAlert.skin="sknLblSPCF020914px";
        this.view.lblOnlineBankingPasswordAlert.text="請輸入";
      }
      else {
        this.view.lblOnlineBankingPasswordAlert.setVisibility(true);
        this.view.flxOnlineBankingPasswords.skin = "sknFlxCF0209Border";
        this.view.lblOnlineBankingPasswordAlert.skin="sknLblSPCF020914px";
        this.view.lblOnlineBankingPasswordAlert.text="網銀密碼要輸入 6 位數以上喔！";
      }

    },
    personalIDCheck:function(){
      rege =/^[a-zA-Z0-9\s]*$/;
      if ((customerID!=="") && (customerID!==null) && (customerID!==undefined) && (customerID.length >= 6) && (customerID.length !==0) && (customerID.length <= 11) && ((customerID.match(rege))) ) {
        this.view.lblIdAlert.setVisibility(false);
        this.view.flxIdNumber.skin = "sknFlxFFFFFFBGBorderedededRadius4PxSP";
      }
      else if((customerID==="") || (customerID===null) || (customerID===0) || (customerID===undefined)){
        this.view.lblIdAlert.setVisibility(true);
        this.view.flxIdNumber.skin = "sknFlxCF0209Border";
        this.view.lblIdAlert.skin="sknLblSPCF020914px";
        this.view.lblIdAlert.text="請輸入";

      }
      else{
        this.view.lblIdAlert.setVisibility(true);
        this.view.flxIdNumber.skin = "sknFlxCF0209Border";
        this.view.lblIdAlert.skin="sknLblSPCF020914px";
        this.view.lblIdAlert.text="請確認身分證字號是否正確喔！";
      }
    },
    validateUserID: function(){
      var sm = applicationManager.getStorageManager();
      var length = this.view.txtBoxIdNumber.text.length;
      if(length < 9) {
        customerID = this.view.txtBoxIdNumber.text;
        this.userIDlength = length;
      } else {
        if(this.userIDlength === 0 && length ===11) {
          customerID = this.view.txtBoxIdNumber.text;
          this.userIDlength = 11;
          this.view.txtBoxIdNumber.text = this.view.txtBoxIdNumber.text.slice(0,8)+"***";
        } else if(this.userIDlength > length) {
          customerID = customerID.slice(0,-1);
          this.userIDlength = this.userIDlength -1;
          this.view.txtBoxIdNumber.text = this.view.txtBoxIdNumber.text.slice(0,-1);
        } else {
          customerID = customerID + this.view.txtBoxIdNumber.text.charAt(length - 1);
          this.userIDlength = this.userIDlength +1;
          this.view.txtBoxIdNumber.text = this.view.txtBoxIdNumber.text.slice(0,-1) + "*";
        }

      }
      var rememberCustID=this.view.txtBoxIdNumber.text;
      sm.setStoredItem("rememberCustID",rememberCustID); 
      sm.setStoredItem("customerID",customerID);
      sm.setStoredItem("userID",userID);
      userID=this.view.txtBoxIdNumber.text;
      var alphanumeric = /^[a-zA-Z0-9*\s]*$/;
      if(userID.match(alphanumeric)){
        this.view.lblIdAlert.setVisibility(false);
        this.view.flxIdNumber.skin =  "sknFlxFFFFFFBGBorderedededRadius4PxSP";
      }
      else{
        this.view.lblIdAlert.setVisibility(true);
        this.view.flxIdNumber.skin = "sknFlxCF0209Border";
        this.view.lblIdAlert.skin="sknLblSPCF020914px";
        this.view.lblIdAlert.text="請確認身分證字號是否正確喔！";
      }
    },
    resetPassword: function(){
      var request={};
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"TermsAndConditionsUIModule"});
      AppGroup.presentationController.verifyStaffCheck(request);
    },
    branchandATM: function(){
      var formId={appName: "AboutUsMA",
                  friendlyName: "BranchATMLocateUIModule/frmSelectionLocation"
                 };
      var navManager = applicationManager.getNavigationManager();
      navManager.navigateTo(formId);
    },
    scheduleTimer: function(reset){  
      kony.timer.cancel("timer1");
      kony.timer.schedule("timer1",this.getExchangeRateServiceCall, reset, true);
      this.view.lblDateTime.text="更新時間: "+CommonUtilities.currentDateTime();
    },
    //exchangeRate
    //getTrialCalculation
    getTrialCalculationCall: function(){
      var convertAmt="";
      if(this.view.txtBoxDebitAmount.text===null || this.view.txtBoxDebitAmount.text.length===0){
        convertAmt="1";
      }else{
        convertAmt=this.view.txtBoxDebitAmount.text;
      }
      var request ={
        "decOriAmt":convertAmt,
        "strFrCcy":this.view.lblTopCurrEng.text,
        "strToCcy":this.view.lblBotCurrEng.text
      };
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModuleExchangeRate"});
      AppGroup.presentationController.getTrialCalculation(request);
    },
    //getExchangeRate:
    getExchangeRateServiceCall: function(){
      kony.application.showLoadingScreen("slFbox","加載中...",constants.
                                         LOADING_SCREEN_POSITION_ONLY_CENTER, false,true,{enableMenuKey:true, 
                                                                                          enableBackKey:true, progressIndicatorColor : "ffffff77"});
      var request = {};    
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModuleExchangeRate"});
      AppGroup.presentationController.getexchangeRates(request);
    },
    exchangeRatePopupCheck: function(){
      if(this.view.flxExchangeRatePopup.isVisible===true || this.view.flxExchangeTrialPopup.isVisible===true){
        this.view.flxExchangeRatePopup.isVisible(false);
        this.view.flxExchangeTrialPopup.isVisible(false);
        this.view.flxPopups.isVisible(false);
      }
    },
    commonPopupClose: function(){
      this.view.flxManinIn.isVisible=false;
      this.view.flxPopups.isVisible=false;
      this.view.flxConfirmationMessagesPopup.isVisible=false;
      this.view.flxVersionUpdate.isVisible=false;
      this.view.flxOpenWebVersion.isVisible=false;
      this.view.flxSuspensionofBankingMembers.isVisible=false;
      this.view.flxWrongMessage.isVisible=false;
      this.view.flxWrongPasswordBelowFiveTime.isVisible=false;
      this.view.flxUserCodeErrorPopUp.isVisible=false;
      this.view.flxExchangeRatePopup.isVisible=false;
      this.view.flxExchangeTrialPopup.isVisible=false;
      this.view.flxSelectCountryPopup.isVisible=false;
    },
    exchangeRateOpen: function(){
      this.view.flxMain.isVisible=false;
      this.view.flxManinIn.isVisible=false;
      this.commonPopupClose();
      this.view.flxPopups.isVisible=true;
      this.view.flxExchangeRatePopup.isVisible=true;
      this.getExchangeRateServiceCall();
    },
    trialCalculation: function(){
      this.view.flxMain.isVisible=false;
      this.view.flxManinIn.isVisible=false;
      this.commonPopupClose();
      this.view.flxPopups.isVisible=true;
      this.view.flxExchangeTrialPopup.isVisible=true;
      this.getTrialCalculationCall();
    },
    closeExchange: function(){
      this.view.flxMain.isVisible=true;
      this.commonPopupClose();
    },
    closeTrialcal: function(){
      this.view.flxPopups.isVisible=true;
      this.view.flxExchangeTrialPopup.isVisible=false;
      this.view.flxExchangeRatePopup.isVisible=true;
    },
    closeSearch: function(){
      this.view.flxPopups.isVisible=true;
      this.view.flxSelectCountryPopup.isVisible=false;
      this.view.flxExchangeTrialPopup.isVisible=true;
    },
    exchangeRateMapping: function(response){
      kony.application.dismissLoadingScreen();
      var navManager = applicationManager.getNavigationManager();
      navManager.setCustomInfo("selectFlagResponse",response.J_CURR);
      var defaultCurr = ["USD","JPY","CNY","HKD","EUR"];  
      this.currencydata=response.J_CURR;
      var getDefaultCurr=[];
      for(var i=0;i<defaultCurr.length;i++){
        for(var j=0;j<response.vSPListRate.length;j++){
          if(defaultCurr[i]===response.vSPListRate[j].DispCode){
            getDefaultCurr.push(response.vSPListRate[j]);
            break;
          }
        }
      }
      var setDefaultCurr=[];
      for(var k=0;k<getDefaultCurr.length;k++){
        var tempData={
          "imgNotification":{
            "src":"notificationmb.png",
            "isVisible":false
          },
          "imgChart":{
            "src":"linechart.png",
          },
          "imgFlag":SinopacMBConstants.flags[getDefaultCurr[k].DispCode],
          "lblFlagCurrency":getDefaultCurr[k].DispName,
          "lblCurrencyCode":getDefaultCurr[k].DispCode,
          "lblDays":"30d",
          "lblBankBuy":getDefaultCurr[k].ListBuy,
          "lblBankSell":getDefaultCurr[k].ListSell,

        };
        setDefaultCurr.push(tempData);
      }
      var dataMap={
        "imgNotification":"imgNotification",
        "imgChart":"imgChart",
        "imgFlag":"imgFlag",
        "lblFlagCurrency":"lblFlagCurrency",
        "lblCurrencyCode":"lblCurrencyCode",
        "lblDays":"lblDays",
        "lblBankBuy":"lblBankBuy",
        "lblBankSell":"lblBankSell",
      };
      this.view.segExchangeRateTable.widgetDataMap=dataMap;
      this.view.segExchangeRateTable.setData(setDefaultCurr);
    },
    setNoDataExchange: function(){
      kony.application.dismissLoadingScreen();
      this.view.flxExchangeRateTable.setVisibility(false);
      this.view.flxTimeAndEditGroup.setVisibility(false);
      this.view.flxNodataAvailableGrp.setVisibility(true);
    },
    setCountryFlags: function(removeCurr){
      var scope = this;
      var navManager = applicationManager.getNavigationManager();
      var flagData=navManager.getCustomInfo("selectFlagResponse");
      var defaultCurr = ["TWD","USD","JPY","HKD","EUR","GBP","CHF","AUD","SGD","SEK","CAD","THB","ZAR","NZD","MOP","CNY","CNH"];
      var index = defaultCurr.indexOf(removeCurr);
      defaultCurr.splice(index, 1);
      var getDefaultCurr = [];
      for(var i=0;i<defaultCurr.length;i++){
        for(var j=0;j<flagData.length;j++){
          if(defaultCurr[i]===flagData[j].CURRENAME){
            getDefaultCurr.push(flagData[j]);
            break;
          }
        }
      }
      var setCountryData = [];
      for(var k=0;k<getDefaultCurr.length;k++){
        var tempData ={
          "imgTick":{
            "src":"list_tick.png",
            "isVisible":false
          },
          "imgFlag":SinopacMBConstants.flags[getDefaultCurr[k].CURRENAME],
          "lblCurrencyName":getDefaultCurr[k].CURRCNAME,
          "lblCurrency":getDefaultCurr[k].CURRENAME
        };
        setCountryData.push(tempData);
      }
      var dataMap={
        "imgFlag":"imgFlag",
        "lblCurrencyName":"lblCurrencyName",
        "imgTick":"imgTick",
        "lblCurrency":"lblCurrency"
      };
      scope.view.SelectCountry.segCountries.widgetDataMap = dataMap;
      scope.view.SelectCountry.segCountries.setData(setCountryData);
    }, 
    showInUseCurrency: function(){
      var scope = this;
      this.setCountryFlags(scope.view.lblBotCurrEng.text);
      this.view.flxMain.isVisible=false;
      this.view.flxManinIn.isVisible=false;
      this.commonPopupClose();
      this.view.flxPopups.isVisible=true;
      this.view.flxSelectCountryPopup.isVisible=true;
      var data = this.view.SelectCountry.segCountries.data;
      for(var i=0;i<data.length;i++){
        data[i].imgTick.isVisible = scope.view.lblCurrencyName.text === data[i].lblCurrencyName ? true : false;
      }
      this.view.SelectCountry.segCountries.setData(data);
      this.view.SelectCountry.segCountries.onRowClick = function(){
        scope.view.imgFlag.src = scope.view.SelectCountry.segCountries.selectedRowItems[0].imgFlag;
        scope.view.lblCurrencyName.text = scope.view.SelectCountry.segCountries.selectedRowItems[0].lblCurrencyName;
        scope.view.lblTopCurrEng.text = scope.view.SelectCountry.segCountries.selectedRowItems[0].lblCurrency;
        scope.closeSearch();
        //         if(scope.view.txtBoxDebitAmount.text!==null){

        scope.getTrialCalculationCall();

        //       }
      };
    },
    showConversionCurrency: function(){
      var scope = this;
      this.setCountryFlags(scope.view.lblTopCurrEng.text);
      this.view.flxMain.isVisible=false;
      this.view.flxManinIn.isVisible=false;
      this.commonPopupClose();
      this.view.flxPopups.isVisible=true;
      this.view.flxSelectCountryPopup.isVisible=true;
      var data = this.view.SelectCountry.segCountries.data;
      for(var i=0;i<data.length;i++){
        data[i].imgTick.isVisible = scope.view.lblConvertedCurrency.text === data[i].lblCurrencyName ? true : false;
      }
      this.view.SelectCountry.segCountries.setData(data);
      this.view.SelectCountry.segCountries.onRowClick = function(){
        scope.view.imgCountryFlag.src = scope.view.SelectCountry.segCountries.selectedRowItems[0].imgFlag;
        scope.view.lblConvertedCurrency.text = scope.view.SelectCountry.segCountries.selectedRowItems[0].lblCurrencyName;
        scope.view.lblBotCurrEng.text = scope.view.SelectCountry.segCountries.selectedRowItems[0].lblCurrency;
        scope.closeSearch();
        //         if(scope.view.txtBoxDebitAmount.text!==null){

        scope.getTrialCalculationCall();

        //       }
      };
    },
    showTrialCalculation: function(response){
      var check=["N"];
      var trailResponse=[];
      for( var i=0;i<check.length;i++){
        for(var j=0;j<response.ETSSpotDeal.length;j++){
          if(check[i]===response.ETSSpotDeal[j].NoteFlag){
            trailResponse.push(response.ETSSpotDeal[j]);
            break;
          }
        }
      }
      if(this.view.txtBoxDebitAmount.text===null || this.view.txtBoxDebitAmount.text.length===0){
        this.view.txtBoxAmountDebit.text="";
      }else{
        this.view.txtBoxAmountDebit.text=trailResponse[0].CrossAmount;
      }

      this.view.lblReferenceRateValue.text="參考匯率 "+trailResponse[0].CrossRate;
    },
    swapCurrency: function(){
      var tempFlag = this.view.imgFlag.src;
      var tempCurrency = this.view.lblCurrencyName.text;
      var tempEngCurr = this.view.lblTopCurrEng.text;
      this.view.imgFlag.src = this.view.imgCountryFlag.src;
      this.view.lblCurrencyName.text = this.view.lblConvertedCurrency.text;
      this.view.lblTopCurrEng.text = this.view.lblBotCurrEng.text;
      this.view.imgCountryFlag.src = tempFlag;
      this.view.lblConvertedCurrency.text = tempCurrency;
      this.view.lblBotCurrEng.text=tempEngCurr;
      // if(this.view.txtBoxDebitAmount.text!==null || this.view.txtBoxDebitAmount.text.length!==0){

      this.getTrialCalculationCall();

      // }
    },
    navToForeignCurrencyExchangeRate: function(){
      var navManager = applicationManager.getNavigationManager();
      formId={appName: "ForeignExchangeMA",
              friendlyName: "ForeignExchangeUIModule/frmForeignCurrencyExchangeRate"
             };
      navManager.setCustomInfo("frmForeignCurrencyExchangeRate",{"selectedTab":"sinoLogin"});
      navManager.navigateTo(formId);
    },
    navToWingFungExchangeRate: function(){
      var navManager = applicationManager.getNavigationManager();
      formId={appName: "ForeignExchangeMA",
              friendlyName: "ForeignExchangeUIModule/frmWingFungInterestRate"
             };
      navManager.setCustomInfo("frmWingFungInterestRate",{"selectedTab":"sinoLogin"});
      navManager.navigateTo(formId);
    },
    navToGoldQuotes: function(){
      var navManager = applicationManager.getNavigationManager();
      var formId={appName: "InvestmentsMA",
                  friendlyName: "GoldInvestments/frmGoldQuotes"
                 };
      navManager.setCustomInfo("frmGoldQuotes",{"selectedTab":"sinoLogin"});
      navManager.navigateTo(formId);
    },
    showSelectedExchangeRateChart: function(){
      var rowData = this.view.segExchangeRateTable.selectedRowItems[0];
      var navManager = applicationManager.getNavigationManager();
      formId={appName: "ForeignExchangeMA",
              friendlyName: "ForeignExchangeUIModule/frmExchangeRateMovements"
             };
      navManager.setCustomInfo("frmExchangeRateMovements",{"data":rowData,"selectedTab":"sinoLogin"});
      navManager.navigateTo(formId);
    },
    responseForPreLoginCampaigns: function(response){
      var sm = applicationManager.getStorageManager();
      setValue = 1;
      sm.setStoredItem("setValue", setValue);
      if(response.length > 0){
        this.showPreLoginResponse(response);
      }
      else{
        alert(response.serverErrorRes);
      }
    },
    showPreLoginResponse:function(response){
      var scope = this;
      this.campaigns=response;
      var data = [];
      for(var i=0;i<response.length;i++){
        var temp={
          "imgAdCampaigns": {
            "src":response[i].imageURL,
            "onDownloadComplete":scope.dismissIndicator.bind(this,i)
          },
          "lblDescriptionHeading":response[i].bannerTitle,
          "rtxDescription":response[i].bannerDescription
        };
        data.push(temp);
      }
      this.view.segFirstTimeScroll.widgetDataMap={
        "imgAdCampaigns":"imgAdCampaigns",
        "lblDescriptionHeading":"lblDescriptionHeading",
        "rtxDescription":"rtxDescription",
        "flxDescription": "flxDescription",
      };
      this.view.segFirstTimeScroll.setData(data);
      this.view.flxAdCampaigns.setVisibility(true);
      this.view.flxSee.setVisibility(true);
      this.view.flxFirstTimeLaunch.setVisibility(true);
      this.view.btnViewNow.onClick = this.navToScreen;
      this.view.flxSee.onClick = this.loginFunction; 
      kony.application.showLoadingScreen("slFbox","加載中...",constants.
                                         LOADING_SCREEN_POSITION_ONLY_CENTER, false,true,{enableMenuKey:true, 
                                                                                          enableBackKey:true, progressIndicatorColor : "ffffff77"});
      kony.timer.schedule("Discover4",this.generateAlert, 1, false);
    },
    dismissIndicator: function(index){
      if(index === 0){
        kony.timer.cancel("Discover4");
        kony.timer.schedule("Discover5",this.dismissIndicator1, 3, false);
      }
    },
    generateAlert: function(){
      kony.application.showLoadingScreen("slFbox","加載中...",constants.
                                         LOADING_SCREEN_POSITION_ONLY_CENTER, false,true,{enableMenuKey:true, 
                                                                                          enableBackKey:true, progressIndicatorColor : "ffffff77"});
    },
    dismissIndicator1: function(){
      kony.timer.cancel("Discover5");
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName": "AuthenticationMA","moduleName":"AuthUIModule"});
      AppGroup.presentationController.customerDeviceGet();
      kony.application.dismissLoadingScreen();
    },
    navToScreen: function(){
      var formId = "";
      var index = this.indexValue;
      var data = this.campaigns[index];
      var split = data.callToActionTargetURL.split("##");
      formId={appName: split[0],
              friendlyName: split[1]
             };
      var navManager = applicationManager.getNavigationManager();
      navManager.setCustomInfo("setDashboardPage", formId);
      this.setDashboardPage();
    },
    loginFunction: function(){  
      //           this.campaignCheck();
      this.goToLoginWithoutTnC();      
      //this.view.flxPrivacyPolicy.setVisibility(true);
      //this.view.imgInvisibleTick.onTouchEnd=this.setImage;


      //  var navManager = applicationManager.getNavigationManager();
      // navManager.setCustomInfo("setDashboardPage", "");
      //  navManager.navigateTo("frmSinoLogin");
    },
    setDashboardPage: function(){
      var navManager = applicationManager.getNavigationManager();
      navManager.navigateTo("frmSinoLogin");
    },
    //exchange rate


    initiateBiometrics: function() {
      this.showNativePopup();
    },

    showNativePopup: function() {
      var scope = this;
      this.view.flxMain.setVisibility(true);
      this.view.flxNativePopup.setVisibility(true);
      this.view.nativePopup.btnLink1.onClick = function() {
        scope.view.flxMain.setVisibility(true);
        scope.view.flxNativePopup.setVisibility(false);
      };
      this.view.nativePopup.btnLink2.onClick = function() {
        //kony.application.showLoadingScreen("slFbox","加載中...",constants.LOADING_SCREEN_POSITION_ONLY_CENTER, false,true,{enableMenuKey:true, enableBackKey:true, progressIndicatorColor : "ffffff77"});
        scope.view.flxMain.setVisibility(true);
        scope.view.flxNativePopup.setVisibility(false);
        scope.initiateFidoAuthentication();
      };
    },

    initiateFidoAuthentication: function() {
      var cred = {
        "identifier": "Login_Cred"
      };
      var customer_id = kony.keychain.retrieve(cred);
      customer_id = customer_id.securedata;
      var request = {
        "apid": "Mapp",
        "nation": "TW",
        "applytype": "P",
        "pid": customer_id,
        "cid": "",
        "channels": "UAF",
        "timelinesec": "120",
        "filter1": "",
        "filter2": "",
        "filter3": "",
        "filter4": "",
        "filter5": ""
      };
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"TermsAndConditionsUIModule"});
      AppGroup.presentationController.fetchFidoAuthentication(request);
    },

    invokeFidoAuthentication: function(response) {
      this.fidoAuthenticationDetails = response;
      //alert("1"+ response);
      //var NFICreation8=java.import('sdk.mobilesdk.fido.com.wrapper.KonyWrapper');
      //NFICreation8.doFidoAuthFor(this.authenticationResult,response.FidoBiometrics[0].qrid,"https://mobilebanksb.sinopac.com","");
      if(kony.os.deviceInfo().name === "android"){
        this.authenticationResult("true");
      } else {
        this.fidoAuthStatus = "";
        var objectClass = objc.import("SPFido");
        var initObj = objectClass.alloc().jsinit();
        initObj.doFidoAuthForHandler(this.fidoAuthenticationDetails.FidoBiometrics[0].qrid, this.authenticationResult);
      }
    },

    authenticationResult: function(result,details) {
      //alert(details);
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"AuthUIModule"});
      var cred = {
        "identifier": "Login_Cred"
      };
      var customer_id = kony.keychain.retrieve(cred);
      customer_id = customer_id.securedata;
      var navManager = applicationManager.getNavigationManager();
      var errorCount = navManager.getCustomInfo("quickLoginErrorCount");
      var request = {
        "NEWMBFASTERRORS": (parseInt(errorCount)+1).toString(),
        "CUSTID": customer_id
      };
      if(kony.os.deviceInfo().name === "android") {
        this.completeFidoAuthentication(true);
      } else {
        if(this.fidoAuthStatus === "" && result === true) {
          this.fidoAuthStatus = true;
          return;
        } else if (this.fidoAuthStatus === true && result === true) {
          this.completeFidoAuthentication(details);
        } else if (this.fidoAuthStatus === true && result === false) {
          AppGroup.presentationController.updateQuickLoginErrorCount(request);
        } else if (result === false){
          AppGroup.presentationController.updateQuickLoginErrorCount(request);
        }
      }
    },

    completeFidoAuthentication: function() {
      var navManager = applicationManager.getNavigationManager();
      navManager.setCustomInfo("loginFlow", "biometricFlow");
      this.JBRootCheck();
    },

    processFidoVerificationResult: function(response) {
      //kony.application.dismissLoadingScreen();
      alert("Login Successful");
    },

    showQuickLoginPrechecks: function() {
      if(kony.os.deviceInfo().name === "android"){
        var isRooted=java.callStaticMethod('sdk.mobilesdk.fido.com.wrapper.KonyWrapper','getIsDeviceRooted');
        if(isRooted === true){
          this.view.flxPopups.setVisibility(true);
          this.view.flxVersionUpdate.setVisibility(true);
          this.view.commonPopup.lblHeading.text ="貼心提醒";
          this.view.commonPopup.lblDescription.text ="偵測到您的裝置有進行 ROOT，為了您的交易安全，請謹慎使用行動銀行，以避免資訊外洩風險。";
          this.view.commonPopup.Buttons.btnSPActionPrimary.text ="確定";
        }else{
          this.view.flxPopups.setVisibility(false);
          this.view.flxVersionUpdate.setVisibility(false);
          this.view.flxMain.setVisibility(true);
          this.checkUSBDebuggedEnabledQuickLogin();
        }
      } else {
        this.view.flxPopups.setVisibility(false);
        this.view.flxVersionUpdate.setVisibility(false);
        this.view.flxMain.setVisibility(true);
        this.checkUSBDebuggedEnabledQuickLogin();
      }
    },

    checkUSBDebuggedEnabledQuickLogin: function(){
      var navManager = applicationManager.getNavigationManager();
      if(kony.os.deviceInfo().name === "android"){
        var isUSBDebug = java.callStaticMethod('com.example.googleplaycheck.KonyWrapper','isBeingDebugged');
        if(isUSBDebug === true){
          this.view.flxPopups.setVisibility(true);
          this.view.flxVersionUpdate.setVisibility(true);
          this.view.commonPopup.lblHeading.text ="貼心提醒";
          this.view.commonPopup.lblDescription.text ="偵測到您的裝置有進行USB偵錯功能，為了您的交易安全，請謹慎使用行動銀行，以避免資訊外洩風險。";
          this.view.commonPopup.Buttons.btnSPActionPrimary.text ="確定";
        }else{
          this.view.flxPopups.setVisibility(false);
          this.view.flxVersionUpdate.setVisibility(false);
          this.view.flxMain.setVisibility(true);
          this.checkBlackListedDevicesQuickLogin();
        }
      }else{
        var objectClass = objc.import("SPFido");
        var initObj = objectClass.alloc().jsinit();
        isRooted = initObj.isJailBroken();
        if(isRooted === false){
          this.view.flxPopups.setVisibility(false);
          this.view.flxVersionUpdate.setVisibility(false);
          this.view.flxMain.setVisibility(true);
          this.checkBlackListedDevicesQuickLogin();
        } else {
          this.view.flxPopups.setVisibility(true);
          this.view.flxVersionUpdate.setVisibility(true);
          this.view.commonPopup.lblHeading.text ="貼心提醒";
          this.view.commonPopup.lblDescription.text ="偵測到您的裝置有進行USB偵錯功能，為了您的交易安全，請謹慎使用行動銀行，以避免資訊外洩風險。";
          this.view.commonPopup.Buttons.btnSPActionPrimary.text ="確定";
        }
      }
    },

    checkBlackListedDevicesQuickLogin: function() {
      var navManager = applicationManager.getNavigationManager();
      navManager.setCustomInfo("QuickLoginBlackListedDevices", "true");
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"TermsAndConditionsUIModule"});
      AppGroup.presentationController.getBlacklistedDevices();
    },

    blackListedDevicesQuickLoginResponse: function(response) {
      var blackListedDevices = response;
      var isBlacklisted = false;
      var deviceID = CommonUtilities.getDeviceID();
      kony.print("--Device ID--" + deviceID);
      for(var i=0;i<blackListedDevices.BlacklistedDevices.length;i++) {
        if(blackListedDevices.BlacklistedDevices[i].id === deviceID) {
          isBlacklisted = true;
        }
      }
      if(isBlacklisted) {
        this.blockDevice = true;
        this.view.flxPopups.isVisible = true;
        this.view.flxVersionUpdate.isVisible = true;
        this.view.commonPopup.lblHeading.text = "無法使用「生物辨識登入」功能";
        this.view.commonPopup.lblDescription.text = "為維護您的登入安全，部分手機型號目前無法使用「生物辨識登入」功能，建議您改用一般登入或其他快速登入方式進行使用。";
        this.view.commonPopup.Buttons.btnSPActionPrimary.text = "確定";
      } else {
        this.showQuickLogin();
      }
    },

    showQuickLoginErrorPopup: function(count) {
      var scope = this;
      kony.application.dismissLoadingScreen();
      this.view.commonPopups.lblHeading.text = "快速登入錯誤次數已達上限";
      this.view.commonPopups.lblDescription.text = "您的快速登入錯誤次數已達上限 "+count+" 次，將自動關閉「快速登入」服務，請您重新使用會員代碼/密碼啟用";
      this.view.commonPopups.Buttons.btnSPActionSecondary.setVisibility(false);
      this.view.commonPopups.Buttons.btnSPActionPrimary.text = "確定"; //sure btn
      this.view.commonPopups.Buttons.btnSPActionPrimary.width = "100%";
      this.view.commonPopups.Buttons.btnSPActionPrimary.left = "0%";
      this.view.commonPopups.Buttons.btnSPActionPrimary.onClick = function() {
        scope.view.flxPopups.setVisibility(false);
        scope.view.flxVersionUpdate.setVisibility(false);
        scope.view.flxOpenWebVersion.setVisibility(false);
		scope.showGeneralLogin();
      };
      this.view.flxPopups.setVisibility(true);
      this.view.flxOpenWebVersion.setVisibility(true);
    },

    usrPwValidation: function(){
      var custId = this.view.txtBoxIdNumber.text;
      var user = this.view.txtBoxUserId.text;
      var passwrd = this.view.txtBoxOnlineBankingPasswords.text;
      if (custId === null) {
        this.view.lblIdAlert.setVisibility(true);
        this.view.flxIdNumber.skin = "sknFlxCF0209Border";
        this.view.lblIdAlert.skin = "sknLblSPCF020914px";
        this.view.lblIdAlert.text = "請輸入";
      }
      if (user === null) {
        this.view.lblUserIdAlert.setVisibility(true);
        this.view.flxUserId.skin = "sknFlxCF0209Border";
        this.view.lblUserIdAlert.skin = "sknLblSPCF020914px";
        this.view.lblUserIdAlert.text = "請輸入";
      }
      if (passwrd === null) {
        this.view.lblOnlineBankingPasswordAlert.setVisibility(true);
        this.view.flxOnlineBankingPasswords.skin = "sknFlxCF0209Border";
        this.view.lblOnlineBankingPasswordAlert.skin = "sknLblSPCF020914px";
        this.view.lblOnlineBankingPasswordAlert.text = "請輸入";
      }
      var regex = /^([a-zA-Z]){1,19}([0-9]){1,19}$/;
      reg = /^[a-zA-Z0-9*\s]*$/;
      var passwordValidation = (passwrd!==null && passwrd!==undefined && passwrd.match(regex)) ? true : false;
      var usercode = (user!==null && user!==undefined && user.match(regex)) ? true : false;
      var id = (userID!==null && userID!==undefined && userID.match(reg)) ? true : false;

      if(userID!==null && user!==null && passwrd!==null && user.length >= 6 && user.length <=20 && usercode === true && passwrd.length >= 6 && passwrd.length <=20 && passwordValidation === true && id === true)
      {
        this.JBRootCheck();
      }
    },

    usrPwEncryption: function(){
      var user = this.view.txtBoxUserId.text;
      var passwrd = this.view.txtBoxOnlineBankingPasswords.text;
      var navManager = applicationManager.getNavigationManager();
      var certString = navManager.getCustomInfo("certString");
      certString = "MIIF5jCCA86gAwIBAgIETupN9DANBgkqhkiG9w0BAQsFADBhMQswCQYDVQQGEwJUVzEbMBkGA1UEChMSVEFJV0FOLUNBLkNPTSBJbmMuMRgwFgYDVQQLEw9FdmFsdWF0aW9uIE9ubHkxGzAZBgNVBAMTElRhaUNBIFRlc3QgRlhNTCBDQTAeFw0yMjAzMjkwNzAwMzBaFw0yNDA1MjcxNTU5NTlaMIGQMQswCQYDVQQGEwJUVzEQMA4GA1UEChMHRmluYW5jZTEbMBkGA1UECxMSVGFpQ0EgVGVzdCBGWE1MIENBMSQwIgYDVQQLExs3MDc1OTAyOC1UQUlXQU4tQ0EuQ09NIEluYy4xDTALBgNVBAsTBEZYTUwxHTAbBgNVBAMTFDg2NTE3Mzg0LTAxLTIwNDhURVNUMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu48155g0mwsc+HWBn3xRKVTyq84qBcYtZRqFQTv6v20LJ258Fov2YjvQCX+ryHDx8SdK9YMaY2HH67QBqZGXKW6F/GXUXKUw7ZvJo9DuU7qv4UdskshlTj8FP/yFWFirnbN3P8qxWF3pwdWyqs8HNVmTv7je0M5jq74zi6C/rJ3KghJI+BMIovI7i5oKXWyfjheIG0HziaYmXZ3bf8FvQzI1904vWJ53cmztBhDB72PqN5Q4q9ySjaSncAAuIpZPRlJrYMR1+nWIeMpDlTp5YwP9cXrNfbIXRS1EO+87bKITnW6P0Uhs8bmEzAbuKHJ9GuSv3CiPCfpdT9PDLEMIWwIDAQABo4IBdDCCAXAwKwYDVR0jBCQwIoAgm8uIcpr23Wkc9LbDE0kAd63pTivRe2kUnGaSZ3IlQKwwKQYDVR0OBCIEIFP1TgzUNOp7trmHsrxy+QF45ascVKRybFweVurYuAlnME8GA1UdHwRIMEYwRKBCoECGPmh0dHA6Ly9pdGF4LnR3Y2EuY29tLnR3L3Rlc3RjcmwvVGVzdF9mdWNhX3Jldm9rZV9TaGEyXzIwMjAuY3JsMA0GA1UdEQQGMASBAkBAMDoGCCsGAQUFBwEBBC4wLDAqBggrBgEFBQcwAYYeaHR0cDovL09DU1BfRXZhbC5UYWljYS5jb20udHc6MF8GA1UdIARYMFYwVAYHYIEeAwEIBTBJMCMGCCsGAQUFBwIBFhdodHRwOi8vd3d3LnR3Y2EuY29tLnR3LzAiBggrBgEFBQcCAjAWGhRSZXN0cmljdGlvbiA9MC4yLjMuMTAJBgNVHRMEAjAAMA4GA1UdDwEB/wQEAwIGwDANBgkqhkiG9w0BAQsFAAOCAgEAAHrZrxU7uFZO8wm/rmDSmK9yWVjwhsgCAEzjgUsEB37MGPQkitpUCSbir/La5NhdT1g2YGk51ndtfOXMGUMhWt0EVvTnuuJ5lKaFgCpQpytX0XfLEXrzGuiqZIkEIW3a5RGUX4CpIqaMubuOW+vyaZiM+eCq2RXQZwA8pXmjkQu3UmAjU4mSvCIJp6uGDqDNDSjd0Ldvm9V+MjEakeN+ZmXNzayUyZvBniufU61F3M6JKlr6IaR2VUGv8viJmlF90d/4W5j8Mv8zK8Qgl8sJJybYnDvBsjPiIb5dUv3PkPZff3wNfxKwwhlk7txMQ98usL3bt7dFClfapXVLF4MjOafJJQF/xWYnXd1KiIoWl+rphgSPrSUz6L9DWpSwkYKUhxSaVGc9wNvB7pl7cK9RJ1wETbWotjBa0A2Ylx9MrJ0Iya8DTwlNazJ/oXq8ArR87qhy7JOr65AaYXLEIXl79jlMksOm9wR8zkyhmZLpcx8nnX1MvrRdBaASaedxV0D4U0KXIlMjHJPrd7tH6xoCGFXDIB67KF9TsQ3zIqAsbxdBVUjnY6axRfQCHdD7BQta1VR8Ckwl5Cl10VoN85ColldWkdp4uzb2u75YNjJcciQmPpEK4zHhBa5JzTEmhRZXklo2F6KP1C+4dtMXozdPj0dIbqcYhsIqLIDT38gUCyc=";
      var encryptedValues = CommonUtilities.getEncryptionValue(user,passwrd,certString);
      encryptedUsername = encryptedValues.encryptUserCode;
      encryptedPassword = encryptedValues.encryptPassCode;

      this.login();
    },

    navigateToDashboard: function(){
      var navManager = applicationManager.getNavigationManager();	  
      var customerID = applicationManager.getSessionManager().getCustomerID();
      var type = navManager.getCustomInfo("loginFlow");
      if(type !== undefined && type !== null && type !== "" && type === "graphicFlow"){
        generalLoginFlag = "FAST";
        this.SessionManager.setLoginType(generalLoginFlag);
        navManager.setCustomInfo("generalLoginFlag",generalLoginFlag);
        var dashBoardScreen=navManager.getCustomInfo("dashBoardScreen");
        if(dashBoardScreen !== null && dashBoardScreen !== undefined && dashBoardScreen !== "" && dashBoardScreen.friendlyName === "frmQuickLoginSetting"){
          dashBoardScreen = null;
          navManager.setCustomInfo("dashBoardScreen", dashBoardScreen);
        }
      }else{
        var sm = applicationManager.getStorageManager();
        var loginCred = customerID;
        var data = {
          "identifier": "Login_Cred"
        };
        kony.keychain.remove(data);
        if(kony.os.deviceInfo().name === "android") {
          cred = {
            "securedata": loginCred,
            "identifier": "Login_Cred"
          };
        } else {
          cred = {
            "securedata": loginCred,
            "secureaccount": "credentials",
            "identifier": "Login_Cred",
          };
        }
        kony.keychain.save(cred);
        //var navManager = applicationManager.getNavigationManager();
        generalLoginFlag = "GENERAL";
        this.SessionManager.setLoginType(generalLoginFlag);
        navManager.setCustomInfo("generalLoginFlag",generalLoginFlag);
      }
      var formName = navManager.getCustomInfo("setDashboardPage");
      var dashBoardScreen=navManager.getCustomInfo("dashBoardScreen");
      if(formName !== null && formName !== undefined && formName !== ""){
        navManager.navigateTo(formName);
      } else if(dashBoardScreen !== null && dashBoardScreen !== undefined && dashBoardScreen !== ""){ 
        navManager.navigateTo(dashBoardScreen);
      } else{
        var formId={appName: "ArrangementsMA",
                    friendlyName: "DepositUIModule/frmHomedptAccount"
                   };
        navManager.setCustomInfo("frmHomedptAccount",customerID);
        navManager.navigateTo(formId,customerID);
      }
    },

    closeIncorrectCustIdPopup: function(){
      this.view.flxPopups.setVisibility(false);
      this.view.flxOpenWebVersion.setVisibility(false);
    },

    navigateToPasswordReset: function(){
      this.view.flxPwChangeRequired.setVisibility(false);

      var navManager = applicationManager.getNavigationManager();
      var formName = {
        appName: "AuthenticationMA",
        friendlyName: "TermsAndConditionsUIModule/frmPasswordReset"
      };
      navManager.navigateTo(formName);
    },

    closePwChangeRequiredPopup: function(){
      this.view.flxPwChangeRequired.setVisibility(false);
	  
      if (isCreditCardCustomer === "No") {
		this.showUpdateContactInfoPopup();
	  } else {
	    this.navigateToDashboard();
	  }
    },
	
	updateCustomerDeviceDetails: function(bindingType,action) {
      var navManager = applicationManager.getNavigationManager();
	  var data = navManager.getCustomInfo("deviceBoundDetails");
      var request = {
        "id": this.deviceID,
        "Customer_id": this.customerID,
        "BINDINGTYPE": bindingType,
        "ACTIONMPHONENAME": kony.os.deviceInfo().model,
        "modifiedby": data.customerdevice[0].modifiedby,
        "DeviceName":data.customerdevice[0].DeviceName,
        "ACTIONTYPE": action
      };
      var AppGroup = kony.mvc.MDAApplication.getSharedInstance().getModuleManager().getModule({"appName":"AuthenticationMA","moduleName":"TermsAndConditionsUIModule"});
      AppGroup.presentationController.updateCustomerGraphic(request);
    },
	
	showUpdateSuccessPopup: function(response) {
      if(response.message === "failure"){
        kony.application.dismissLoadingScreen();
        alert("service failed");
      }else{
		this.showQuickLoginErrorPopup(5);
	  }
	},
	
	checkContactInfo: function(ic0001Resp) {
		var address = ic0001Resp.TAddr2Signs[0].TAddr2Sign;
		addressStatus = (address === "2")? true : false;

		var email = ic0001Resp.TEmailSigns[0].TEmailSign;
		emailStatus = (email === "2")? true : false;

		var phone = [];
		phone = ic0001Resp.Tphones;
		var i = 0;
		while(i<phone.length){
			if(phone[i].TPhoneSign === "2"){
				phoneStatus = true;
				break;
			} else {
				phoneStatus = false;
			}
			i++;
		}
	},
	
	navigateToContactInfo: function(){
      this.view.flxUpdateContactInfo.setVisibility(false);

      var navManager = applicationManager.getNavigationManager();
      var formName = {
        appName: "ManageProfileMA",
        friendlyName: "PersonalizationUIModule/frmContactInformation"
      };
      navManager.navigateTo(formName);
    },

    closeUpdateContactInfoPopup: function(){
      this.view.flxUpdateContactInfo.setVisibility(false);
      this.navigateToDashboard();
    },
	
	showUpdateContactInfoPopup: function() {
		if (phoneStatus === true && emailStatus === true && addressStatus === true) {
			this.view.updateContactInfoPopup.lblHeading.text = "溫馨提醒";
			this.view.updateContactInfoPopup.lblDescription.setVisibility(false);
			this.view.updateContactInfoPopup.rtxDesc.setVisibility(true);
			this.view.updateContactInfoPopup.rtxDesc.text = "親愛的客戶 , 您留存於本行的通訊資料 (項目如下)久未更新 , 為保障您的個人 權益 , 請立即更新您的資料 , 謝謝。<div><ul><li>電子郵件信箱</li><li>通訊地址</li><li>聯絡電話(住家/公司/其他/特機)</li></ul></div>";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.text = "立即變更";
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.text = "下次再說";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.onClick = this.navigateToContactInfo;
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.onClick = this.closeUpdateContactInfoPopup;
			this.view.flxUpdateContactInfo.setVisibility(true);
		} else if (phoneStatus === true && emailStatus === true) {
			this.view.updateContactInfoPopup.lblHeading.text = "溫馨提醒";
			this.view.updateContactInfoPopup.lblDescription.setVisibility(false);
			this.view.updateContactInfoPopup.rtxDesc.setVisibility(true);
			this.view.updateContactInfoPopup.rtxDesc.text = "親愛的客戶 , 您留存於本行的通訊資料 (項目如下)久未更新 , 為保障您的個人 權益 , 請立即更新您的資料 , 謝謝。<div><ul><li>電子郵件信箱</li><li>聯絡電話(住家/公司/其他/特機)</li></ul></div>";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.text = "立即變更";
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.text = "下次再說";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.onClick = this.navigateToContactInfo;
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.onClick = this.closeUpdateContactInfoPopup;
			this.view.flxUpdateContactInfo.setVisibility(true);
		} else if (emailStatus === true && addressStatus === true) {
			this.view.updateContactInfoPopup.lblHeading.text = "溫馨提醒";
			this.view.updateContactInfoPopup.lblDescription.setVisibility(false);
			this.view.updateContactInfoPopup.rtxDesc.setVisibility(true);
			this.view.updateContactInfoPopup.rtxDesc.text = "親愛的客戶 , 您留存於本行的通訊資料 (項目如下)久未更新 , 為保障您的個人 權益 , 請立即更新您的資料 , 謝謝。<div><ul><li>電子郵件信箱</li><li>通訊地址</li></ul></div>";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.text = "立即變更";
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.text = "下次再說";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.onClick = this.navigateToContactInfo;
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.onClick = this.closeUpdateContactInfoPopup;
			this.view.flxUpdateContactInfo.setVisibility(true);
		} else if (phoneStatus === true && addressStatus === true) {
			this.view.updateContactInfoPopup.lblHeading.text = "溫馨提醒";
			this.view.updateContactInfoPopup.lblDescription.setVisibility(false);
			this.view.updateContactInfoPopup.rtxDesc.setVisibility(true);
			this.view.updateContactInfoPopup.rtxDesc.text = "親愛的客戶 , 您留存於本行的通訊資料 (項目如下)久未更新 , 為保障您的個人 權益 , 請立即更新您的資料 , 謝謝。<div><ul><li>通訊地址</li><li>聯絡電話(住家/公司/其他/特機)</li></ul></div>";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.text = "立即變更";
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.text = "下次再說";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.onClick = this.navigateToContactInfo;
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.onClick = this.closeUpdateContactInfoPopup;
			this.view.flxUpdateContactInfo.setVisibility(true);
		} else if (phoneStatus === true) {
			this.view.updateContactInfoPopup.lblHeading.text = "溫馨提醒";
			this.view.updateContactInfoPopup.lblDescription.setVisibility(false);
			this.view.updateContactInfoPopup.rtxDesc.setVisibility(true);
			this.view.updateContactInfoPopup.rtxDesc.text = "親愛的客戶 , 您留存於本行的通訊資料 (項目如下)久未更新 , 為保障您的個人 權益 , 請立即更新您的資料 , 謝謝。<br><br><div><ul><li>聯絡電話(住家/公司/其他/手機)</li></ul></div>";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.text = "立即變更";
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.text = "下次再說";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.onClick = this.navigateToContactInfo;
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.onClick = this.closeUpdateContactInfoPopup;
			this.view.flxUpdateContactInfo.setVisibility(true);
		} else if (emailStatus === true) {
			this.view.updateContactInfoPopup.lblHeading.text = "溫馨提醒";
			this.view.updateContactInfoPopup.lblDescription.setVisibility(false);
			this.view.updateContactInfoPopup.rtxDesc.setVisibility(true);
			this.view.updateContactInfoPopup.rtxDesc.text = "親愛的客戶 , 您留存於本行的通訊資料 (項目如下)久未更新 , 為保障您的個人 權益 , 請立即更新您的資料 , 謝謝。<br><br><div><ul><li>電子郵件信箱</li></ul></div>";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.text = "立即變更";
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.text = "下次再說";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.onClick = this.navigateToContactInfo;
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.onClick = this.closeUpdateContactInfoPopup;
			this.view.flxUpdateContactInfo.setVisibility(true);
		} else if (addressStatus === true) {
			this.view.updateContactInfoPopup.lblHeading.text = "溫馨提醒";
			this.view.updateContactInfoPopup.lblDescription.setVisibility(false);
			this.view.updateContactInfoPopup.rtxDesc.setVisibility(true);
			this.view.updateContactInfoPopup.rtxDesc.text = "親愛的客戶 , 您留存於本行的通訊資料 (項目如下)久未更新 , 為保障您的個人 權益 , 請立即更新您的資料 , 謝謝。<div><ul><li>通訊地址</li></ul></div>";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.text = "立即變更";
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.text = "下次再說";
			this.view.updateContactInfoPopup.Buttons.btnSPActionPrimary.onClick = this.navigateToContactInfo;
			this.view.updateContactInfoPopup.Buttons.btnSPActionSecondary.onClick = this.closeUpdateContactInfoPopup;
			this.view.flxUpdateContactInfo.setVisibility(true);
		} else {
			this.navigateToDashboard();
		}
	}
  };
});