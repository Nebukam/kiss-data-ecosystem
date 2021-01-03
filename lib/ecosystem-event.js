'use strict';

const _evt_valueChanged = Symbol(`valueChanged`);
const _evt_baseChanged = Symbol(`baseChanged`);

class ECOSYSTEM_EVENT {
    constructor() { }

    static get VALUE_CHANGED() { return _evt_valueChanged; }
    static get BASE_CHANGED() { return _evt_baseChanged; }

}

module.exports = ECOSYSTEM_EVENT;