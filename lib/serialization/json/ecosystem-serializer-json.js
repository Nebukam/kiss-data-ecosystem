'use strict';

const { U } = require(`@nkm/utils`);
const { POOL, BINDINGS } = require(`@nkm/common`);
const { Serializer, SKEYS } = require(`@nkm/data-core`);

const Model = require(`../../data/model`);
const DataEntry = require(`../../data/data-entry`);
const FieldSettings = require(`../../data/fields/field-settings`);

const type_entry = `entry`;
const type_model = `model`;
const type_field = `field`;
const type_default = `default`;

/**
 * This is a copy-paste of the @nkm-core-data JSONSerializer with small twists to accomodate Models, Fields etc.
 * TODO : When the ecosystem module is 'initialized' (and it must be), replace the existing one.
 */
class EcosystemJSONSerializer extends Serializer {
    constructor() { super(); }

    static Serialize(p_target, p_options = null) {

        //Find suitable JSON Object serializer depending on target type.
        var serializer = BINDINGS.Get(p_target.constructor, SKEYS.JSON, null);

        if (!serializer) {
            throw new Error(`Could not find suitable serializer for target=${p_target}`);
        }

        var serial = serializer.Serialize(p_target);

        var nfos = serial.__nfos__;
        if (!nfos) { nfos = {}; serial.__nfos__ = nfos; }

        var type = nfos.type;

        if (U.isInstanceOf(p_target, Model)) {
            type = type_model;
        } else if (U.isInstanceOf(p_target, DataEntry)) {
            type = type_entry;
        } else if (U.isInstanceOf(p_target, FieldSettings)) {
            type = type_field;
        } else {
            type = type_default;
        }

        nfos.type = type;
        nfos.instanceOf = p_target.constructor.name;

        return serial;

    }

    static Deserialize(p_serial, p_options = null, p_target = null) {

        var cl = null;
        var serializer = null;

        if (p_target != null) {

            cl = p_target.constructor;

        } else {

            var nfos = p_serial.__nfos__;
            if (!nfos) {
                //There is no nfos in the serial.
                throw new Error(`Cannot unserialize without nfos`);
            }

            var type = nfos.type;
            var instanceOf = nfos.instanceOf;

            var cl = POOL.GetClass(instanceOf);

            if (!cl) {
                throw new Error(`No class is registered with id = ${cl}`);
            }

            var ecosystem = p_options ? p_options.ecosystem : null;
            var id = p_options ? p_options.id : null;

            if (type == type_entry
                || type == type_field
                || type == type_model) {
                if (!ecosystem || !id) {
                    throw new Error(`Missing required infos for deserialization ecosystem=${ecosystem}, id=${id}`);
                }

                switch (type) {
                    case type_entry:
                        p_target = ecosystem.entries.CreateTemp(null, cl);
                        ecosystem.entries.Register(p_target, id);
                        break;
                    case type_model:
                        p_target = ecosystem.models.CreateTemp(null, cl);
                        ecosystem.models.Register(p_target, id);
                        break;
                    case type_field:
                        throw new Error(`not implemented`);
                        break;
                }

            } else {
                p_target = POOL.Rent(cl);
            }

        }

        serializer = BINDINGS.Get(cl, SKEYS.JSON, null);

        if (!serializer) {
            throw new Error(`Could not find suitable de-serializer for target=${p_target}`);
        }

        return serializer.Deserialize(p_serial, p_options, p_target);
    }

}

module.exports = EcosystemJSONSerializer;