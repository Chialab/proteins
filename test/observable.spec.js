/* eslint-env mocha */
import Observable from '../src/observable.js';
import Symbolic from '../src/symbolic.js';

describe('Unit: Observable', () => {
    describe('simple object', () => {
        let changes = [];
        let observable = new Observable({
            firstName: 'Alan',
            lastName: 'Turing',
            birthday: new Date('1912/06/23'),
        });

        observable.on('change', (changset) => {
            changes.push(changset);
        });
        
        it('should not trigger changes if object is not changed', () => {
            observable.firstName = 'Alan';

            assert.equal(changes.length, 0);
        });

        it('should trigger changes if object has been updated', () => {
            observable.lastName = 'Skywalker';

            let change = changes[0];
            assert.equal(change.value, 'Skywalker');
            assert.equal(change.oldValue, 'Turing');
        });

        it('should trigger changes', () => {
            assert.equal(changes.length, 1);
        });
    });

    describe('simple Array', () => {
        let changes = [];
        let observable = new Observable([
            'Luke',
            'Anakin',
            'Padme',
        ]);

        observable.on('change', (changset) => {
            changes.push(changset);
        });
        
        it('should not trigger changes if object is not changed', () => {
            observable[0] = 'Luke';

            assert.equal(changes.length, 0);
        });
        
        it('should trigger changes if object has been updated', () => {
            observable[1] = 'Darth Vader';

            let change = changes[0];
            assert.equal(change.value, 'Darth Vader');
            assert.equal(change.oldValue, 'Anakin');
        });

        it('should trigger changes for array functions', () => {
            observable[2] = 'Leia';
            observable.pop();
            observable.push('Leia', 'Han Solo');

            assert.equal(changes[1].property, '2');
            assert.equal(changes[1].oldValue, 'Padme');
            assert.equal(changes[1].value, 'Leia');
            assert.equal(changes[2].property, '2');
            assert.equal(changes[2].added.length, 0);
            assert.equal(changes[2].removed.length, 1);
            assert.equal(changes[2].removed[0], 'Leia');
            assert.equal(changes[3].property, '2');
            assert.equal(changes[3].added.length, 2);
            assert.equal(changes[3].removed.length, 0);
            assert.deepEqual(changes[3].added, ['Leia', 'Han Solo']);
        });

        it('should trigger changes', () => {
            assert.equal(changes.length, 4);
        });
    });

    describe('complex objects', () => {
        let changes = [];
        let observable = new Observable({
            prop1: 1,
            prop2: ['a', 'b'],
            prop3: {
                prop3_1: 1,
                prop3_2: ['c', 'd'],
            },
            prop4: [
                { prop4_1: 1 },
                { prop4_2: [] },
            ],
        });

        observable.on('change', (changset) => {
            changes.push(changset);
        });

        it('should trigger changes', () => {
            observable.prop1 = 2;
            observable.prop2.push('c');
            observable.prop3.prop3_1 = 2;
            observable.prop3.prop3_2.pop();
            observable.prop4[0].prop4_1 = 2;
            observable.prop4[1].prop4_2.push({
                prop6: 5,
            });
            observable.prop4[1].prop4_2[0].prop6 = 10;

            assert.equal(changes.length, 7);
        });

        it('should compute property name', () => {
            let paths = changes.map((change) => change.property);
            assert.deepEqual(paths, [
                'prop1',
                'prop2.2',
                'prop3.prop3_1',
                'prop3.prop3_2.1',
                'prop4.0.prop4_1',
                'prop4.1.prop4_2.0',
                'prop4.1.prop4_2.0.prop6',
            ]);
        });
    });

    describe('symbolic keys', () => {
        let changes = [];
        let sym = new Symbolic('tags');
        let observable = new Observable({
            name: 'Alan',
            [sym]: ['math'],
        });

        observable.on('change', (changset) => {
            changes.push(changset);
        });

        it('should be ignored', () => {
            observable[sym] = [];
            observable.name = 'Steve';
            assert.equal(changes.length, 1);
        });
    });
});
