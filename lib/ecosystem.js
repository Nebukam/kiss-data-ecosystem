/**
 * The goal of an ecosystem is to isolate and encapsulate
 * all data-related functionalities in a closed ecosystem such as :
 * - a field manager
 * - a model manager
 * - entries etc
 * These parts are usually singletons but it lack flexbility down the line.
 */
'use strict';

const { U, C, URI } = require(`../@.js`);
const { POOL, List, Catalog } = require(`../collections/@.js`);

const DATA_EVENT = require(`./core-data-event.js`);
const DataBlock = require(`./data-block.js`);

const EcosystemCommand = require(`./commands/command-ecosystem.js`);
const CommandCluster = require(`../actions/command-cluster.js`);

const FieldManager = require(`./manager-fields.js`);
const ModelManager = require(`./manager-models.js`);
const EntryManager = require(`./manager-entries.js`);

const EcosystemCleanCatalog = require(`./commands/ecosystem-clean-catalog.js`);

class Ecosystem extends DataBlock{
    constructor() {super();}

    _Init(){

        super._Init();

        this._commands = new CommandCluster(this._Bind(this._OnCmdRegister));
        this._dependencies = {}; //Kits are registered here
        
        var fields = POOL.Rent(FieldManager);
        fields.ecosystem = this;
        fields.Subscribe(DATA_EVENT.ITEM_REGISTERED, this, this._OnFieldRegistered);
        fields.Subscribe(DATA_EVENT.ITEM_UNREGISTERED, this, this._OnFieldUnregistered);
        this._fields = fields;
        
        var models = POOL.Rent(ModelManager);
        models.ecosystem = this;
        models.Subscribe(DATA_EVENT.ITEM_REGISTERED, this, this._OnModelRegistered);
        models.Subscribe(DATA_EVENT.ITEM_UNREGISTERED, this, this._OnModelUnregistered);
        this._models = models;

        var entries = POOL.Rent(EntryManager);
        entries.ecosystem = this;
        entries.Subscribe(DATA_EVENT.ITEM_REGISTERED, this, this._OnEntryRegistered);
        entries.Subscribe(DATA_EVENT.ITEM_UNREGISTERED, this, this._OnEntryUnregistered);
        this._entries = entries;

        this._catalog = new Catalog();
        this._catalog.expanded = true;
        this._catalog.name = `Ecosystem`;

        this._cmdCleanCatalog = this._commands.Create(
            EcosystemCleanCatalog, null,
            `%ICON%/icon_clean.svg`);

        this._catalog.AddCommand(this._cmdCleanCatalog);

    }

    get fields(){return this._fields;}
    get models(){return this._models;}
    get entries(){return this._entries;}

    get catalog(){return this._catalog;}

    Resolve(p_uri){ return URI.Resolve(p_uri, this); }

    _OnFieldRegistered( p_field ){

    }

    _OnFieldUnregistered( p_field ){

    }


    _OnModelRegistered( p_model ){
        this._entries.Deploy(p_model);
        //Check for reference token to this model.
        this._OnEntityRegistered(p_model);
    }

    _OnModelUnregistered( p_model ){
        this._entries.Conceal(p_model);
        this._OnEntityUnregistered(p_model);
    }


    _OnEntryRegistered( p_entry ){
        this._OnEntityRegistered(p_entry);
    }

    _OnEntryUnregistered( p_entry ){
        this._OnEntityUnregistered(p_entry);
    }

    //--->

    _OnEntityRegistered(p_entity){
        p_entity.Subscribe(DATA_EVENT.DIRTY, this, this._OnEntityDirty);
        p_entity.Subscribe(DATA_EVENT.CLEANED, this, this._OnEntityCleaned);
        if(p_entity.dirty){
            this._OnEntityDirty(p_entity);
        }
    }

    _OnEntityUnregistered(p_entity){
        p_entity.Unsubscribe(DATA_EVENT.DIRTY, this, this._OnEntityDirty);
        p_entity.Unsubscribe(DATA_EVENT.CLEANED, this, this._OnEntityCleaned);
    }

    _OnEntityDirty(p_entity){
        
    }

    _OnEntityCleaned(p_entity){

    }

    //--->

    _OnCmdRegister(p_cmd){
        if(U.IoF(p_cmd, EcosystemCommand)){ p_cmd.ecosystem = this; }
    }

    //--->

    _CleanUp(){
        super._CleanUp();
    }

}

module.exports = Ecosystem;