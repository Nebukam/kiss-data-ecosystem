'use strict';

const { U } = require(`@nkm/utils`);
const { Action } = require(`@nkm/actions`);

const Model = require(`../../model`);

class ActionModelCreateField extends Action {
    constructor() { super(); }

    static get mergeable() { return false; }

    //---> Do / undo

    _InternalDo(p_operation, p_merge = false) {

        var op = p_operation;

        var target = op.target;
        var descriptor = op.descriptor;

        var fieldID = `${descriptor.fieldClass.name}${U.unsafeUID}`;
        op.id = fieldID;

        var field = Model.CreateField(
            target,
            descriptor.fieldClass,
            fieldID,
            {
                //TODO : options ?
            });

        op.field = field;

        field.dirty = true;
        console.log(`%cDO : ${target} += ${fieldID}`, 'color: #909090');
        return this;

    }

    _InternalUndo() {
        var op = this._operation;
        op.target.Unregister(op.field);
    }

    _InternalRedo() {
        var op = this._operation;
        op.target.Register(op.field, op.fieldID);
    }

    _CleanUp() {
        if (this._undoed) {
            this._operation.field.Release();
        }
        super._CleanUp();
    }

}

module.exports = ActionModelCreateField;