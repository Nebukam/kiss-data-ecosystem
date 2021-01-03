const { U, ACTION_REQUEST } = require(`../../@`);
const { ID } = require(`../../collections/@`);
const DataManipulationCommand = require(`./command-data`);
const Request = require(`../../signals/request`);

class ModelCreate extends DataManipulationCommand {
    constructor() { super(); this._dataClass = require(`../model`); }

    _Init() {
        super._Init();
        //this._name = `Create Model`;
    }

    _InternalExecute() {

        var tempModel = this._ecosystem.models.CreateTemp();
        var tempID = new ID();

        var name = `NewModel${U.unsafeUID}`;

        //Make sure we don't push a duplicate id
        while (this._ecosystem.models.Get(name)) {
            name = `NewModel${U.unsafeUID}`;
        }

        tempID.name = name;
        tempModel.id = tempID;
        tempModel.dirty = true;

        var options = {
            data: tempModel
        };

        Request.Emit(ACTION_REQUEST.CREATE,
            options, this,
            this._OnRequestSuccess,
            this._OnRequestFail);

    }

    _OnRequestFail(p_request) {
        p_request.options.data.Release();
        this._Fail(`Model creation request has not been handled. Reason : ${p_request.failReason}`);
    }

    _OnRequestSuccess(p_request) { this._Success(); }

}

module.exports = ModelCreate;
