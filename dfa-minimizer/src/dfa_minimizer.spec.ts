import test from 'ava';

import DeterministicFiniteStateMachine, { DFADescription } from './dfa_minimizer'

const machineTests: {
    [name: string]: {
        description: DFADescription,
        accepted: string[],
        rejected: string[],
        minimizedDescription: DFADescription,
    }
} = {
    startsWith0: {
        description: {
            transitions: {
                S: {
                    0: 'A',
                    1: 'B',
                },
                A: {
                    0: 'A',
                    1: 'A',
                },
                B: {
                    0: 'B',
                    1: 'B',
                },
            },
            start: 'S',
            acceptStates: ['A'],
        },
        accepted: ['0', '01', '00000', '0111111'],
        rejected: ['', '10', '10001010', '111111', '101111'],
        minimizedDescription: {
            transitions: {
                S: {
                    0: 'A',
                    1: 'B',
                },
                A: {
                    0: 'A',
                    1: 'A',
                },
                B: {
                    0: 'B',
                    1: 'B',
                },
            },
            start: 'S',
            acceptStates: ['A'],
        }
    },
    divisibleBy3: {
        description: {
            transitions: {
                A: {
                    0: 'A',
                    1: 'B',
                },
                B: {
                    0: 'C',
                    1: 'A',
                },
                C: {
                    0: 'B',
                    1: 'C',
                },
            },
            start: 'A',
            acceptStates: ['A'],
        },
        accepted: ['0', '', '11', '00000', '110000', '101111111101'],
        rejected: ['10', '1010', '100000', '1011111'],
        minimizedDescription: {
            transitions: {
                A: {
                    0: 'A',
                    1: 'B',
                },
                B: {
                    0: 'C',
                    1: 'A',
                },
                C: {
                    0: 'B',
                    1: 'C',
                },
            },
            start: 'A',
            acceptStates: ['A'],
        }
    },
    startsWith010:{
        description: {
            transitions:{
                A: {
                    0: 'B',
                    1: 'C'
                },
                B: {
                    0: 'C',
                    1: 'D'
                },
                C: {
                    0: 'C',
                    1: 'C'
                },
                D: {
                    0: 'F',
                    1: 'E'
                },
                E:{
                    0: 'E',
                    1: 'E'
                },
                F:{
                    0: 'F',
                    1: 'F'
                },
            },
            start: 'A',
            acceptStates: ['F'],
        },
        accepted: ['010', '010000', '010111', '010010'],
        rejected: ['1000', '1', '111'],
        minimizedDescription: {
            transitions: {
                A: {
                    0: 'B',
                    1: 'CE',
                },
                B: {
                    0: 'CE',
                    1: 'D',
                },
                CE: {
                    0: 'CE',
                    1: 'CE',
                },
                D: {
                    0: 'F',
                    1: 'CE',
                },
                F:{
                    0: 'F',
                    1: 'F',
                }
            },
            start: 'A',
            acceptStates: ['F'],
        }
    },
    
    example4:{
        description: {
            transitions:{
                S: {
                    0: 'A',
                    1: 'B'
                },
                B: {
                    0: 'A',
                    1: 'C'
                },
                A: {
                    0: 'C',
                    1: 'D'
                },
                D: {
                    0: 'C',
                    1: 'C'
                },
                C:{
                    0: 'C',
                    1: 'C'
                },
            },
            start: 'S',
            acceptStates: ['C','D'],
        },
        accepted: ['01', '100', '110000', '010000', '1001111'],
        rejected: ['', '1', '0', '10'],
        minimizedDescription: {
            transitions: {
                S: {
                    0: 'A',
                    1: 'B',
                },
                B: {
                    0: 'A',
                    1: 'DC',
                },
                A: {
                    0: 'DC',
                    1: 'DC',
                },
                DC: {
                    0: 'DC',
                    1: 'DC',
                },
            },
            start: 'S',
            acceptStates: ['DC'],
        }
    },
    
    numberOf0sIsMultipleOf3:{
        description: {
            transitions:{
                S: {
                    0: 'A',
                    1: 'D'
                },
                A: {
                    0: 'B',
                    1: 'E'
                },
                B: {
                    0: 'S',
                    1: 'E'
                },
                E: {
                    0: 'D',
                    1: 'D'
                },
                D:{
                    0: 'D',
                    1: 'D'
                },
            },
            start: 'S',
            acceptStates: ['S'],
        },
        accepted: ['', '000', '000000', '000000000'],
        rejected: ['1000', '1', '111', '00011', '0101111', '0', '00'],
        minimizedDescription: {
            transitions: {
                S: {
                    0: 'A',
                    1: 'ED',
                },
                A: {
                    0: 'B',
                    1: 'ED',
                },
                B: {
                    0: 'S',
                    1: 'ED',
                },
                ED: {
                    0: 'ED',
                    1: 'ED',
                },
            },
            start: 'S',
            acceptStates: ['S'],
        }
    },
    
};

for(const [name, testDesc] of Object.entries(machineTests)) {
    test(`${name}/constructor`, (t) =>{
        const dfa = new DeterministicFiniteStateMachine(testDesc.description);
        t.truthy(dfa);
    });
    test(`${name}/transition`, (t) =>{
        const dfa = new DeterministicFiniteStateMachine(testDesc.description);
        const { transitions } = testDesc.description;
        for(const [state, stateTransitions] of Object.entries(transitions)){
            for(const [symbol, nextState] of Object.entries(stateTransitions)){
                t.assert(nextState === dfa.transition(state, symbol));
            }
        }
    });
    test(`${name}/accepts`, (t) =>{
        const dfa = new DeterministicFiniteStateMachine(testDesc.description);
        const { accepted, rejected } = testDesc;
        for(const s of accepted){
            t.assert(dfa.accepts(s));
        }
        for(const s of rejected){
            t.assert(!dfa.accepts(s));
        }
    });
    test(`${name}/minimizer`, (t) =>{
        const dfa = new DeterministicFiniteStateMachine(testDesc.description);
        t.assert(JSON.stringify(dfa.minimize()) === JSON.stringify(new DeterministicFiniteStateMachine(testDesc.minimizedDescription)))
    });
}


