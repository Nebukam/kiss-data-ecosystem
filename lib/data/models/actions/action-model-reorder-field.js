'use strict';

const { Action } = require(`@nkm/actions`);

class ActionModelReorderField extends Action {
    constructor() { super(); }

    static get mergeable() { return true; }

    //---> Can merge ?

    CanMerge(p_operation) {
        var operation = this._operation;

        if (operation.target == p_operation.target) {
            return true;
        } else {
            return false;
        }
    }

    //---> Do / undo

    _InternalDo(p_operation, p_merge = false) {

        var op = p_operation;

        var target = op.target;
        var index = op.index;

        if (!p_merge) {
            this._operation = op;
            op.originalIndex = target.fieldIndex;
        } else {
            op = this._operation;
            op.index = index;
        }

        var model = target.model;
        var list = model.localFieldList.internalArray;
        var currentIndex = list.indexOf(target);

        if (currentIndex > index) { currentIndex++; } //offset remove index based on target position

        list.splice(index, 0, target); //move to new spot
        list.splice(currentIndex, 1); //remove old reference

        console.log(`${target} from ${currentIndex} to ${index}`);

        model._UpdateLocalFieldIndexes(true);

        console.log(`%cDO : ${target} @${op.originalIndex} => ${op.index}|${target.fieldIndex}`, 'color: #909090');
        return this;

    }

    _InternalUndo() {

    }

    _InternalRedo() {

    }

}

module.exports = ActionModelReorderField;