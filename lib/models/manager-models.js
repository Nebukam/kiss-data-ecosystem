'use strict';

const { U, M } = require(`../@.js`);
const { POOL, Dictionary } = require(`../collections/@.js`);

const SystemModel = require(`./model-system.js`);
const EcosystemPart = require(`./ecosystem-part.js`);
const DATA_EVENT = require(`./core-data-event.js`);
const DataLibrary = require(`./data-library.js`);
const Factory = require(`./factory.js`);
const Model = require(`./model.js`);

const { ModelCreate, ModelCreateChild, ModelEdit, ModelCreateEntry, ModelDuplicate } = require(`./commands/@model.js`);

class ModelManager extends EcosystemPart{
    constructor() {super();}

    _Init()
    {
        
        super._Init();

        this._factory = new Factory();
        this._factory.itemClass = Model;

        this._factory.Subscribe(DATA_EVENT.ITEM_REGISTERED, this, this._OnModelRegistered);
        this._factory.Subscribe(DATA_EVENT.ITEM_UNREGISTERED, this, this._OnModelUnregistered);

        this._catMap = new Dictionary();

        this._catalog.name = `Models`;
        this._catalog.icon = `%ICON%/icon_modellist.svg`;

        this._metaTemplate.presentation.catalogPath = ``;

        //Commands

        this._cmdModelCreate = this._commands.Create( 
            ModelCreate, null,
            `%ICON%/icon_create.svg`);

        this._cmdModelCreateChild = this._commands.Create( 
            ModelCreateChild, null,
            `%ICON%/icon_cmd_createchildmodel.svg`); //icon_cmd_createchildmodel

        this._cmdModelEdit = this._commands.Create( 
            ModelEdit, null,
            `%ICON%/icon_cmd_editmodel.svg`);

        this._cmdModelCreateEntry = this._commands.Create(
            ModelCreateEntry, null,
            `%ICON%/icon_plus.svg`);

        this._cmdModelDuplicate = this._commands.Create(
            ModelDuplicate, null,
            `%ICON%/icon_plus.svg`);
            
        this._catalog.AddCommand(this._cmdModelCreate);

    }

    _OnEcosystemChanged(p_oldValue){
        super._OnEcosystemChanged(p_oldValue);
    }

    get factory(){
        return this._factory;
    }

    CreateTemp(p_from = null, p_class = null){
        var model = this._factory.CreateTemp(p_class);
        model.ecosystem = this._ecosystem;
        model.base = p_from;
        this._OnDataCreated(model);
        return model;
    }

    Register(p_model, p_id){
        return this._factory.Register(p_model, p_id);
    }

    Get( p_id ){
        return this._factory.Get(p_id);
    }

    GetDerivations( p_model, p_result = null ){
        if(!p_result){ p_result = new Array(0);}
        var list = this._factory.itemList;
        var m = null;
        for(var i = 0, n = list.length; i < n; i++){
            m = list[i];
            if(m.Inherits(p_model)){ p_result.push(m); }
        }
        return p_result;
    }

    _OnModelRegistered(p_factory, p_model)
    {

        this._OnDataRegistered(p_model);

        //Create an entry in the catalog based on model meta
        var itemOptions = {
            name:p_model.id.name,
            data:p_model,
            path:`${p_model.constructor.name}s/${p_model.id.name}/`,
            icon:U.IoF(p_model, SystemModel) ? `%ICON%/icon_lock.svg` : `%ICON%/icon_model.svg`,
            secondaryCommand:this._cmdModelEdit,
            commandList:[this._cmdModelCreateChild, this._cmdModelCreateEntry] //this._cmdModelDuplicate
        }

        var modelMeta = M.ETA(p_model);

        if(modelMeta){
            //console.log(modelMeta);
            itemOptions.path = U.Default(`${modelMeta.catalogPath}/`, `${itemOptions.path}/`);
            itemOptions.icon = U.Default(modelMeta.icon, itemOptions.icon);
        }else{
            //console.log(`no meta found for ${p_model}`);
        }

        var catEntry = this._catalog.Register(itemOptions);
        catEntry.expanded = true;
        this._catMap.Set(p_model, catEntry);

        // TODO : Listen to model NFO path update

        //console.log(`%c +${p_model}`, 'color: #00d2ff');

        this._Notify(DATA_EVENT.ITEM_REGISTERED, p_model);

    }

    _OnModelUnregistered(p_factory, p_model)
    {
        //Remove catalog's entry for the model that got unregistered
        var catEntry = this._catMap.Get(p_model);
        if(catEntry){
            catEntry.Release();
        }

        this._Notify(DATA_EVENT.ITEM_UNREGISTERED, p_model);        
    }

    /**
     * Checks whether using `p_otherModel` inside `p_userModel` would create a circular reference
     * @param {*} p_userModel 
     * @param {*} p_otherModel 
     */
    CheckCircularReference( p_userModel, p_otherModel ){
        var base = p_otherModel;
        while(base != null){
            if(base == p_userModel){return true;}
            base = base.base;
        }
        return false;
    }

}

module.exports = ModelManager;
