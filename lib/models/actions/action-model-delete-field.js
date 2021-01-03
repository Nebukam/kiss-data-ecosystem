'use strict';

const Action = require(`../../actions/action.js`);

const Model = require(`../model.js`);

class ActionModelDeleteField extends Action{
    constructor() {super();}

    static get mergeable(){return false;}

    //---> Do / undo

    _InternalDo( p_operation, p_merge = false ){

        var target = p_operation.target;
        var model = target.model;

        p_operation.id = target.id.name;

        model.Unregister(target);

        console.log(`%cDO : ${model} -= ${p_operation.id}`, 'color: #909090');
        return this;

    }

    _InternalUndo(){
        var op = this._operation;
        op.model.Register(op.target, op.id);
    }

    _InternalRedo(){
        var op = this._operation;
        op.model.Unregister(op.target);
    }

    _CleanUp(){
        if(!this._undoed){
            this._operation.target.Release();
        }
        super._CleanUp();
    }

}

module.exports = ActionModelDeleteField;