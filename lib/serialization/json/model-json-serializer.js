const { U } = require(`../../@`);
const { POOL } = require(`../../collections/@`);
const { FieldSettings } = require(`../../data-core/@`);

const DataBlockJSONSerializer = require(`./data-block-json-serializer`);
const { AssocManager } = require(`../../environment/@`);
const { SERIALIZER_JSON } = require(`./../keys`);

class ModelJSONSerializer extends DataBlockJSONSerializer{
    constructor(){super();}

    /**
     * Return the target as a JSON Object
     * @param {*} p_target 
     * @param {*} p_options 
     */
    static Serialize( p_target, p_options = null ){
        
        var serial = DataBlockJSONSerializer.Serialize(p_target, p_options);
        
        var definition = serial.definition;
        if(!definition){definition = {}; serial.definition = definition;}

        //Base Model ID
        if(p_target._base){ 
            definition.base = p_target._base.uri; 
        }

        //Fields
        var fields = {}; definition.fields = fields;

        var f = null;
        var fList = p_target._fieldRep.itemList;
        var serializer = null;
        for(var i = 0, n = fList.length; i < n; i++){
            f = fList[i];
            serializer = AssocManager.Get(f.constructor, SERIALIZER_JSON);
            fields[f.id.name] = serializer.Serialize(f, p_options);
        }

        return serial;
    }

    /**
     * Return an entry object from the provided serial
     * Or override available info in provided target.
     * @param {*} p_serial 
     * @param {*} p_options 
     * @param {*} p_target 
     */
    static Deserialize( p_serial, p_options = null, p_target = null ){
        
        var p_target = DataBlockJSONSerializer.Deserialize(p_serial, p_options, p_target);

        var definition = p_serial.definition;
        if(!definition){ return p_target; }

        var base = definition.base;
        if(base){ 
            var baseModel = p_target.ecosystem.Resolve(base);
            if(!baseModel){
                // Create a watch token in the ecosystem so the base reference
                // will be resolved as soon as it is registered
            }else{
                p_target.base = baseModel;
            }
        }

        var fields = definition.fields;
        if(fields){ 
            var f = null;
            var field = null;
            var serializer = null;
            for(var member in fields){
                f = fields[member];
                
                field = p_target.Get(member);
                
                if(!field){
                    field = POOL.Rent(FieldSettings);
                    p_target.Register(field, member);
                }

                serializer = AssocManager.Get(FieldSettings, SERIALIZER_JSON);
                serializer.Deserialize(f, p_options, field);
            }
        }

        return p_target;

    }

}

module.exports = ModelJSONSerializer;