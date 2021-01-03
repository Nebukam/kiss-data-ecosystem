const { U } = require(`../../@.js`);
const EcosystemCommand = require(`./command-ecosystem.js`);

class DataManipulationCommand extends EcosystemCommand{
    constructor() {super(); this._ecosystemFromContext = true; this._dataClass = null;}

    _SanitizeContext(p_context){

        if(!p_context){return null;}
        var dClass =this._dataClass;
        if(U.IoF(p_context, dClass)){return p_context;}
        var cData = p_context.data;
        if(cData){
            if(U.IoF(cData, dClass)){
                return cData;
            }else if(U.IoF(cData.data, dClass)){
                return cData.data;//In case the actual data item is a wrapper.
            }
        }        
        return null;
    }

    _OnContextChanged(){
        if(this._ecosystemFromContext && this._context){
            this.ecosystem = this._context.ecosystem;
        }
    }

}

module.exports = DataManipulationCommand;
