'use strict';

const _evt_baseChanged = Symbol(`baseChanged`);

class ECOSYSTEM_EVENT {
    constructor() { }

    
    static get BASE_CHANGED() { return _evt_baseChanged; }

}

module.exports = ECOSYSTEM_EVENT;