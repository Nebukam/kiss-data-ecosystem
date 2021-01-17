'use strict';

const { JSONSerializer } = require(`@nkm/data-core`);

const DataManipulationCommand = require(`../../commands/command-data`);

class ModelDuplicate extends DataManipulationCommand {
    constructor() { super(); this._dataClass = require(`../model`); }

    CanExecute(p_context) {
        if (!p_context) { return false; }
        return p_context.editable;
    }

    _InternalExecute() {
        try {

            var baseId = this._context.id.name;
            var i = 1;
            var duplicateId = `${baseId}(${i})`;
            var f = this._ecosystem.models._factory;

            while (!f.IsIDAvailable(duplicateId)) { duplicateId = `${baseId}(${i++})`; }

            JSONSerializer.Deserialize(
                JSONSerializer.Serialize(this._context), null,
                { ecosystem: this._ecosystem, id: duplicateId });
        } catch (e) {
            this._Fail(`Error during serialization : ${e.message}`);
            return;
        }

        this._Success();
    }

}

module.exports = ModelDuplicate;
