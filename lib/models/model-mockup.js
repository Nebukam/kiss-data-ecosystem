'use strict';

const { U, C, M } = require(`../@.js`);
const { POOL, DisposableObjectEx } = require(`../collections/@.js`);

const FieldSettings = require(`./field-settings.js`);
const Model = require(`./model.js`);

class ModelMockup extends DisposableObjectEx{


    /**
     * Turns a JS object into a ModelMockup.
     * @param {Object} p_object 
     */
    static Mock( p_object ){
        var mockup = POOL.Rent(ModelMockup);
        try{ 
            mockup.mockup = p_object;
        }catch(err){
            mockup.Release();
            throw err;
        }
        return mockup;
    }

    /**
     * Turn a JS object into a ModelMockup, with handling
     * of extra mockup properties.
     * @param {*} p_object 
     */
    static CompleteMock( p_object ){
        var mockup = ModelMockup.Mock(p_object.mockup);
        mockup.id = p_object.id;
        mockup.base = p_object.base;
        mockup.modelClass = U.Default(p_object.modelClass, Model);
        mockup.NFO = p_object.NFO;
        return mockup;
    }

    /**
     * Expands a mockup into an existing model by creating
     * missing fields.
     * Throws an error if a field with a mockup'd ID already exists
     * with a missmatching type.
     * @param {Model} p_model 
     * @param {ModelMockup} p_mockup 
     */
    static Expand(p_model, p_mockup){

        var oldBase = p_model.base;
        var p_base = p_mockup.base;

        if(p_base){ 
            if(p_model.base && p_model.base.Inherit(p_base)){
                //Do nothing : base model already extends mocked base at some point
            }else{
                p_model.base = p_base; 
            }
        }

        if(!p_model.NFO){
            p_model.NFO = p_mockup.NFO;
        }

        var mockup = p_mockup.mockup;
        var existingField = null;
        var mockField = null;
        var field = null;
        for(var member in mockup){

            existingField = p_model.Get(member);
            mockField = mockup[member];

            if(!existingField){

                Model.CreateField( 
                    p_model, 
                    mockField.cl, 
                    member,
                    { 
                        settings:mockField.settings 
                    });

            }else{

                if(U.IoF(existingField.fieldClass, mockField.cl)){
                    //Field exists, type matches.
                    if(mockField.settings){
                        existingField.Unpack(mockField.settings);
                    }
                    continue;
                }else{
                    //Field exists, type mismatches :()
                    throw new Error();
                }
            }
        }

        return p_model;
        
    }

    /**
     * Creates and register a model in a given ecosystem, based on
     * a given mockup.
     * @param {Ecosystem} p_ecosystem 
     * @param {ModelMockup} p_mockup 
     * @param {String} p_id 
     */
    static Register(p_ecosystem, p_mockup, p_id = null ){
        var model = p_ecosystem.models.CreateTemp(null, p_mockup.modelClass);
        p_ecosystem.models.Register(
            ModelMockup.Expand(model, p_mockup),
            U.Default(p_id, p_mockup.id));

        return model;
    }

    

    constructor() {super();}

    _Init(){
        super._Init();
        this._id = ``;
        this._base = null;
        this._NFO = null;
        this._modelClass = Model;
        this._mockup = {};
        this._fieldCount = 0;
    }

    get NFO(){return this._NFO;}
    set NFO(p_value){
        this._NFO = p_value;
        if(p_value){
            var cPath = U.Get(p_value, `catalogPath`, null);
            if(!cPath || cPath == C.DEFAULT ){
                p_value.catalogPath = `${this._modelClass.name}s/${this._id}/`;
                /*
                //Register to default path
                var arr = new Array(0);
                var b = this._base;
                while(b != null){
                    arr.push(b.id.name);
                    b = b.base;
                }
                arr.push(`User models`);
                arr.reverse();
                arr.push(this._id);
                p_value.catalogPath = arr.join(`/`)+'/';
                */
            }
        }
    }

    get base(){return this._base;}
    set base(p_value){this._base = p_value;}

    get id(){return this._id;}
    set id(p_value){this._id = p_value;}

    get modelClass(){return this._modelClass;}
    set modelClass(p_value){this._modelClass = p_value;}

    get mockup(){return this._mockup;}
    set mockup(p_value){
        this._mockup = p_value;
        if(!p_value){
            this._fieldCount = 0;
        }else{
            var field = null;
            for(var member in p_value){
                if(!p_value[member].hasOwnProperty(`cl`)){
                    throw new Error(`Field ${member} is missing a class definition.`);
                }
                this._fieldCount += 1;
            }
        }
    }

    /**
     * Checks whether a field exists with a given ID
     * @param {String} p_fieldId 
     */
    Has(p_fieldId){ return this._mockup.hasOwnProperty(p_fieldId); }

    Add(p_fieldId, p_fieldClass, p_fieldSettings = null){
        if(U.Empty(p_fieldId)){ throw new Error(`Cannot add a field with an empty ID.`);}
        if(!p_fieldClass){ throw new Error(`Cannot add a field with an empty type.`);}
        var mockup = this._mockup;
        if(mockup.hasOwnProperty(p_fieldId)){
            throw new Error(`Mockup already have a field named ${p_fieldId}`);
        }
        mockup[p_fieldId] = { cl:p_fieldClass, settings:p_fieldSettings };
        this._fieldCount += 1;
    }

    Remove(p_fieldId){
        var mockup = this._mockup;
        if(mockup.hasOwnProperty(p_fieldId)){return;}
        delete mockup[p_fieldId];
        this._fieldCount -= 1;
    }

    /**
     * Checks whether a given model is an exact match of this
     * mockup.
     * @param {Model} p_model 
     * @param {Boolean} p_inspectSettings should the settings match too ?
     */
    Equals(p_model, p_inspectSettings = false){
        

        if(this._fieldCount != p_model.FieldCount(true)){ return false; } //Field count mismatch.

        var mockup = this._mockup;
        var mockField = null;
        var existingField = null;

        for(var member in mockup){
            existingField = p_model.Get(member);
            if(!existingField){return false;}//Field missing
            mockField = mockup[member];
            if(!U.IoF(existingField.fieldClass, mockField.cl)){return false;} //Field type mismatch
            if(!p_inspectSettings){continue;}
            throw new Error(`settings inspection not implemented yet`);
        }

        return true;
    }

    /**
     * Checks whether a given model fits the mockup.
     * This is a loose alternative to Equals(), and only
     * checks wheter fields are present
     * @param {Model} p_model 
     */
    Fits(p_model){

        var mockup = this._mockup;
        var existingField = null;

        for(var member in mockup){
            existingField = p_model.Get(member);
            if(!existingField){return false;}//Field missing
            if(!U.IoF(existingField.fieldClass, mockup[member].cl)){return false;} //Field type mismatch
        }

        return true;
    }

    /**
     * 
     * @param {Ecosystem} p_ecosystem 
     * @param {String} p_id 
     */
    RegisterTo(p_ecosystem, p_id = null ){
        return ModelMockup.Register(p_ecosystem, this, p_id );
    }
    
    /**
     * 
     * @param {Ecosystem} p_ecosystem 
     * @param {Model} p_model
     */
    ExpandTo(p_model){
        ModelMockup.Expand(p_model, this );
    }

    _CleanUp()
    {
        this._id = ``;
        this._base = null;
        this._modelClass = Model;
        this._mockup = {};
        this._NFO = null;
        this._fieldCount = 0;
        super._CleanUp();
    }

}

module.exports = ModelMockup;