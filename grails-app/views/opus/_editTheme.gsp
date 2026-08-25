<div class="card" ng-form="Theme" ng-cloak>
    <div class="card-header">
        <a name="theming">
            <h4 class="section-panel-heading">Theming</h4>
        </a>
    </div>

    <div class="card-body">
        <div class="row">
            <div class="col-sm-12">

                <div class="form-group">
                    <label>Main background colour</label>

                    <div class="input-group">
                        <input id="mainBackgroundColour" type="text"
                               class="form-control ng-pristine ng-valid ng-touched" colorpicker=""
                               colorpicker-close-on-select="" ng-model="opusCtrl.opus.theme.mainBackgroundColour">
                        <span class="input-group-text"
                              ng-style="{background: opusCtrl.opus.theme.mainBackgroundColour}"></span>
                    </div>
                </div>

                <div class="form-group">
                    <label>Main text colour</label>

                    <div class="input-group">
                        <input id="mainTextColour" type="text" class="form-control ng-pristine ng-valid ng-touched"
                               colorpicker="" colorpicker-close-on-select=""
                               ng-model="opusCtrl.opus.theme.mainTextColour">
                        <span class="input-group-text"
                              ng-style="{background: opusCtrl.opus.theme.mainTextColour}"></span>
                    </div>
                </div>

                <div class="form-group">
                    <label>Call to action colour</label>

                    <div class="input-group">
                        <input id="callToActionColour" type="text" class="form-control ng-pristine ng-valid ng-touched"
                               colorpicker="" colorpicker-close-on-select=""
                               ng-model="opusCtrl.opus.theme.callToActionColour">
                        <span class="input-group-text"
                              ng-style="{background: opusCtrl.opus.theme.callToActionColour}"></span>
                    </div>

                </div>

                <div class="form-group">
                    <label>Call to action hover colour</label>

                    <div class="input-group">
                        <input id="callToActionHoverColour" type="text"
                               class="form-control ng-pristine ng-valid ng-touched" colorpicker=""
                               colorpicker-close-on-select="" ng-model="opusCtrl.opus.theme.callToActionHoverColour">
                        <span class="input-group-text"
                              ng-style="{background: opusCtrl.opus.theme.callToActionHoverColour}"></span>
                    </div>

                </div>


                <div class="form-group">
                    <label>Call To Action Text Colour</label>

                    <div class="input-group">
                        <input id="callToActionTextColour" type="text"
                               class="form-control ng-pristine ng-valid ng-touched" colorpicker=""
                               colorpicker-close-on-select="" ng-model="opusCtrl.opus.theme.callToActionTextColour">
                        <span class="input-group-text"
                              ng-style="{background: opusCtrl.opus.theme.callToActionTextColour}"></span>
                    </div>

                </div>

                <div class="form-group">
                    <label>Footer Background Colour</label>

                    <div class="input-group">
                        <input id="footerBackgroundColour" type="text"
                               class="form-control ng-pristine ng-valid ng-touched" colorpicker=""
                               colorpicker-close-on-select="" ng-model="opusCtrl.opus.theme.footerBackgroundColour">
                        <span class="input-group-text"
                              ng-style="{background: opusCtrl.opus.theme.footerBackgroundColour}"></span>
                    </div>

                </div>

                <div class="form-group">
                    <label>Footer Text Colour</label>

                    <div class="input-group">
                        <input id="footerTextColour" type="text" class="form-control ng-pristine ng-valid ng-touched"
                               colorpicker="" colorpicker-close-on-select=""
                               ng-model="opusCtrl.opus.theme.footerTextColour">
                        <span class="input-group-text"
                              ng-style="{background: opusCtrl.opus.theme.footerTextColour}"></span>
                    </div>

                </div>

                <div class="form-group">
                    <label>Footer Border Colour</label>

                    <div class="input-group">
                        <input id="footerBorderColour" type="text" class="form-control ng-pristine ng-valid ng-touched"
                               colorpicker="" colorpicker-close-on-select=""
                               ng-model="opusCtrl.opus.theme.footerBorderColour">
                        <span class="input-group-text"
                              ng-style="{background: opusCtrl.opus.theme.footerBorderColour}"></span>
                    </div>

                </div>

                <div class="form-group">
                    <label>Header Text Colour</label>

                    <div class="input-group">
                        <input id="headerTextColour" type="text" class="form-control ng-pristine ng-valid ng-touched"
                               colorpicker="" colorpicker-close-on-select=""
                               ng-model="opusCtrl.opus.theme.headerTextColour">
                        <span class="input-group-text"
                              ng-style="{background: opusCtrl.opus.theme.headerTextColour}"></span>
                    </div>

                </div>

                <div class="form-group">
                    <label>Header Border Colour</label>

                    <div class="input-group">
                        <input id="headerBorderColour" type="text" class="form-control ng-pristine ng-valid ng-touched"
                               colorpicker="" colorpicker-close-on-select=""
                               ng-model="opusCtrl.opus.theme.headerBorderColour">
                        <span class="input-group-text"
                              ng-style="{background: opusCtrl.opus.theme.headerBorderColour}"></span>
                    </div>

                </div>

            </div>
        </div>
    </div>

    <div class="card-footer">
        <div class="row">
            <div class="col-md-12">
                <save-button ng-click="opusCtrl.saveOpus(Theme)" form="Theme"></save-button>
            </div>
        </div>
    </div>
</div>