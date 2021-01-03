'use strict';

const { U } = require(`../../@.js`);
const Action = require(`../../actions/action.js`);

const Model = require(`../model.js`);

class ActionModelOverrideField extends Action{
    constructor() {super();}

    static get mergeable(){return false;}

    //---> Do / undo

    _InternalDo( p_operation, p_merge = false ){

        var op = p_operation;

        var target = op.target;
        var originalField = op.originalField;
        var fieldID = originalField.id.name;

        var field = Model.CreateField( 
            target, 
            originalField.fieldClass, 
            fieldID, 
            {
                //TODO : options ?
            }); 

        op.field = field;

        field.dirty = true;
        console.log(`%cDO : ${target} *= ${fieldID} (${field.base})`, 'color: #909090');
        return this;

    }

    _InternalUndo(){
        var op = this._operation;
        op.target.Unregister(op.field);
    }

    _InternalRedo(){
        var op = this._operation;
        op.target.Register(op.field, op.fieldID);
    }

    _CleanUp(){
        if(this._undoed){
            this._operation.field.Release();
        }
        super._CleanUp();
    }

}

module.exports = ActionModelOverrideField;