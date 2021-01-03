'use strict';

const { U, M } = require(`../@.js`);
const { Dictionary, Catalog } = require(`../collections/@.js`);

const EcosystemPart = require(`./ecosystem-part.js`);
const DATA_EVENT = require(`./core-data-event.js`);
const Factory = require(`./factory.js`);
const Field = require(`./field.js`);
const FieldDescriptor = require(`./field-descriptor.js`);

class FieldManager extends EcosystemPart{
    constructor() {super();}

    _Init()
    {
        
        super._Init();

        this._factory = new Factory();
        this._factory.itemClass = FieldDescriptor;

        this._factory.Subscribe(DATA_EVENT.ITEM_REGISTERED, this, this._OnFieldRegistered);
        this._factory.Subscribe(DATA_EVENT.ITEM_UNREGISTERED, this, this._OnFieldUnregistered);

        this._idMap = new Dictionary();
        
        this._catalog.name = `Fields`;
        this._catalog.icon = `%ICON%/icon_fieldlist.svg`;
        
    }

    Register( p_fieldClass )
    {

        if(!U.IoF(p_fieldClass, Field)){
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
                path:fieldMETA.catalogPath,
                data:fieldItem,
                icon:U.Default(fieldMETA.icon, `%ICON%/icon_field.svg`),
                name:U.CamelSplit(p_fieldClass.name)
            }
        );

        //#LOG console.log(`%c+ ${p_fieldClass.name}`, 'color: #00589b');

    }

    Get( p_id ){
        return this._factory.Get(p_id);
    }
    
    _OnFieldRegistered(p_factory, p_field)
    {
        this._OnDataRegistered(p_field);
        this._Notify(DATA_EVENT.ITEM_REGISTERED, p_field);
    }

    _OnFieldUnregistered(p_factory, p_field)
    {
        this._Notify(DATA_EVENT.ITEM_UNREGISTERED, p_field);
    }

}

module.exports = FieldManager;
