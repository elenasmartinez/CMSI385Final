import test from 'ava';

import NonDeterministicFiniteStateMachine, { NFADescription } from './nfaSimulator';

const machineTests: {
    [name: string]: {
        description: NFADescription,
        accepted: string[],
        rejected: string[],
    }
} = { 
    startsWith0: {
        description: {
            transitions: {
                S: {
                    0: ['A']
                },
                A: {
                    0: ['A'], 
                    1: ['A']
                },
            },
            start: 'S',
            acceptStates: ['A']
        },
        accepted: ['0', '01', '00000', '0111111'],
        rejected: ['', '10', '10001010', '111111', '101111'],
    },
    divisibleBy3: {
        description: {
            transitions: {
                r0: {
                    0: ['r0'],
                    1: ['r1']
                },
                r1: {
                    0: ['rλ'],
                    1: ['r0']
                },
                rλ: {
                    0: ['r1'],
                    1: ['rλ']
                }
            },
            start: 'r0',
            acceptStates: ['r0']
        },
        accepted: ['', '0', '11', '00000', '110000', '101111111101'],
        rejected: ['10', '1010', '100000', '1011111'],
    },
    noConsecutive0s: {
        description: {
            transitions: {
                A: {
                    0: ['B'],
                    1: ['A']
                },
                B: { 
                    1: ['A']
                },
            },
            start: 'A',
            acceptStates: ['A', 'B']
        },
        accepted: ['', '01', '010101', '11111', '1010111', '110110'],
        rejected: ['00', '100', '111001', '010100', '10001'],
    },
    divisibleByλ: {
        description: {
            transitions: {
                A: {
                    0: ['A'],
                    1: ['B'],
                },
                B: {
                    0: ['A'],
                    1: ['B']
                }
            },
            start: 'A',
            acceptStates: ['A']
        },
        accepted: ['0000','001110', '01100110', '00011110'],
        rejected: ['01', '000111', '11', '01', '0110011', '1'],

    }, 
    starClosureStartsWith0EndsWith0: {
        description: {
            transitions: {
                A: {
                    λ: ['B']
                },
                B: {
                    0: ['C'],
                },
                C: {
                    0: ['C', 'D'],
                    1: ['C']
                },
                D:{
                    λ: ['A'],
                }
            },
            start: 'A',
            acceptStates: ['A', 'D']
        },
        accepted: ['', '0101010', '011110', '00000', '00', '01110010', '01100010'],
        rejected: ['01', '0', '10', '1110001','01011', '110110'],
    },    
    even0sOrEven1s: {
        description: {
            transitions: {
                S: {
                    λ: ['A', 'C'],
                },
                A: {
                    0: ['B'],
                    1: ['A']
                },
                B: {
                    0: ['A'],
                    1: ['B']
                },
                C:{
                    0: ['C'],
                    1: ['D']
                },
                D:{
                    0: ['D'],
                    1: ['C']
                }
            },
            start: 'S',
            acceptStates: ['A', 'C']
        },
        accepted: ['0110', '0011', '0000', '111100', '10101010'],
        rejected: ['1110', '01', '111000', '011111', '101010'],
    },
    mnpq: {
        description: {
            transitions: {
                M: {
                    λ: ['N', 'P'],
                },
                N: {
                    λ: ['Q'],
                    0: ['Q', 'P']
                },
                P: {
                    1: ['N'],
                },
                Q:{
                    0: ['P'],
                    1: ['N']
                }
            },
            start: 'M',
            acceptStates: ['Q']
        },
        accepted: ['010', '10', '0010', '010010', '101010', '010010010', '0'],
        rejected: ['','01', '0101', '0100', '1','101'],
    },
    EndsWithMoreThan3ZerosOrDivisibleByλ: {
        description: {
            transitions: {
                A: {
                    λ: ['B', 'G'],
                },
                B: {
                    0: ['C'],
                    1: ['C']
                },
                C: {
                    0: ['C', 'D'],
                    1: ['C']
                },
                D:{
                    0: ['E']
                },
                E:{
                    0: ['F']
                },
                G: {
                    0: ['G'],
                    1: ['H'],
                },
                H: {
                    0: ['G'],
                    1: ['H']
                }
            },
            start: 'A',
            acceptStates: ['F', 'G']
        },
        accepted: ['0000', '001110', '01100110', '011111000', '010101000'],
        rejected: ['011', '000111', '11', '01', '0110011', '1'],
    },    
};

for (const [name, testDescription] of Object.entries(machineTests)) {
    test(`${name}/nfa/constructor`, (t) =>{
        const nfa = new NonDeterministicFiniteStateMachine(testDescription.description);
        t.truthy(nfa);
    });

    test(`${name}/nfa/transitions`, (t) => {
        const nfa = new NonDeterministicFiniteStateMachine(testDescription.description);
        const { transitions } = testDescription.description;
    
        for(const [state, stateTransitions] of Object.entries(transitions)) {
            for(const [symbol, nextStates] of Object.entries(stateTransitions)) {
                t.assert(nextStates === nfa.transition(state, symbol));
            }
        }
    });

    test(`${name}/nfa/accepts`, (t) => {
        const nfa = new NonDeterministicFiniteStateMachine(testDescription.description);
        const { accepted, rejected } = testDescription;
        for(const s of accepted){
            t.assert(nfa.accepted(s));
       }
        for(const s of rejected){
            t.assert(!nfa.accepted(s));
        }
    });
}
