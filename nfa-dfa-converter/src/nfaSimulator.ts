
type State = string;
type InputSymbol = string;

export interface NFADescription {
    transitions: {
        [key: string]: {
            λ?: State[],
            0?: State[],
            1?: State[]
        }
    },
    start: State,
    acceptStates: State[]
}

export default class NonDeterministicFiniteStateMachine {
    private pathFound: boolean;
    private description: NFADescription;
    constructor(description: NFADescription) {
        this.description = description;
    }

    transition(state: State, symbol: InputSymbol): State[] {
        const {
            description: { transitions },
        } = this;
        return (symbol in transitions[state]) ? transitions[state][symbol] : [];
    }
    accepted(s: string){
        this.pathFound = false;
        this.accepts(s, this.description.start);
        return this.pathFound;
    }
    accepts(s: string, state: State){
        const {
            description: { acceptStates },
        } = this;
        if(s.length == 0){
            if(acceptStates.includes(state)){
                this.pathFound = true;
            }
            return acceptStates.includes(state);
        }
        if(this.transition(state, "λ").length >0){
            let lambdaMoves = this.transition(state, "λ");
            for(let i=0; i< lambdaMoves.length; i++){
                this.accepts(s, lambdaMoves[i]);
            }
            if(this.transition(state,"0") == [] && this.transition(state,"0") == []){
                return null;
            }
        }
        const nextStates: State[] = this.transition(state, s.charAt(0));
        if(nextStates.length == 0){
            return false;
        }
        const string = s.substr(1);
        if(nextStates.length > 1){
        for(let i = 1; i< nextStates.length; i++){
            this.accepts(string, nextStates[i]);
            }
        }
        return this.accepts(string, nextStates[0]);
    }
}
