'use strict';

const { U } = require(`@nkm/utils`);
const { Dictionary } = require(`@nkm/collections`);
const { DATA_EVENT, DataFactory } = require(`@nkm/data-core`);

const M = require(`../meta`);
const EcosystemPart = require(`../ecosystem-part`);
const Field = require(`../data/fields/field`);
const FieldDescriptor = require(`../data/fields/field-descriptor`);

class FieldManager extends EcosystemPart {
    constructor() { super(); }

    _Init() {

        super._Init();

        this._factory = new DataFactory();
        this._factory.itemClass = FieldDescriptor;

        this._factory.Subscribe(DATA_EVENT.ITEM_REGISTERED, this._OnFieldRegistered, this);
        this._factory.Subscribe(DATA_EVENT.ITEM_UNREGISTERED, this._OnFieldUnregistered, this);

        this._idMap = new Dictionary();

        this._catalog.name = `Fields`;
        this._catalog.icon = `%ICON%/icon_fieldlist.svg`;

    }

    Register(p_fieldClass) {

        if (!U.isInstanceOf(p_fieldClass, Field)) {
            throw new Error("Attempting to register a non-field class.");
        }

        var fieldID = p_fieldClass.name;
        var fieldItem = this._factory.CreateTemp();
        fieldItem.fieldClass = p_fieldClass;

        this._OnDataCreated(fieldItem);

        this._factory.Register(fieldItem, fieldID);
        this._idMap.Set(p_fieldClass, fieldItem.id);

        var fieldMETA = M.ETA(p_fieldClass);

        this._catalog.Register(
            {
                path: fieldMETA.catalogPath,
                data: fieldItem,
                icon: U.Default(fieldMETA.icon, `%ICON%/icon_field.svg`),
                name: U.CamelSplit(p_fieldClass.name)
            }
        );

        //#LOG console.log(`%c+ ${p_fieldClass.name}`, 'color: #00589b');

    }

    Get(p_id) {
        return this._factory.Get(p_id);
    }

    _OnFieldRegistered(p_factory, p_field) {
        this._OnDataRegistered(p_field);
        this._Notify(DATA_EVENT.ITEM_REGISTERED, p_field);
    }

    _OnFieldUnregistered(p_factory, p_field) {
        this._Notify(DATA_EVENT.ITEM_UNREGISTERED, p_field);
    }

}

module.exports = FieldManager;
