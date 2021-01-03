const { U, ACTION_REQUEST } = require(`../../@`);
const DataManipulationCommand = require(`./command-data`);
const Request = require(`../../signals/request`);

class ModelSave extends DataManipulationCommand {
    constructor() { super(); this._dataClass = require(`../model`); }

    CanExecute(p_context) {
        if (!p_context) { return false; }
        return super.CanExecute(p_context);
    }

    _InternalExecute() {

        var options = {
            data: this._context
        };

        console.log(`Stringifyied and packed ${this._context} =`);
        console.log(JSON.stringify(this._context.Pack(), U.JSONStripEmpty, '  '));

        Request.Emit(ACTION_REQUEST.SAVE,
            options, this,
            this._OnRequestSuccess,
            this._OnRequestFail);

    }

    _OnRequestFail(p_request) { this._Fail(); }
    _OnRequestSuccess(p_request) { this._Success(); }

}

module.exports = ModelSave;
