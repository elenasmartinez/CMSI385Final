type State = string
type InputSymbol = string


export interface DFADescription{
    transitions: {
        [key:string]: {
            0: State,
            1: State,
        }
    }, 
    start: State,
    acceptStates: State[],
}

export default class DeterministicFiniteStateMachine{
    private description: DFADescription
    constructor(description: DFADescription){
        this.description = description
    }
    transition(state: State, symbol:InputSymbol): State{
        const {description: { transitions }} = this 
        return transitions[state][symbol]
    }
    accepts(s: string): boolean{
        const {description: { start, acceptStates }} = this
        let state = start
        for(const symbol of s){
            state = this.transition(state, symbol)
        }
        return acceptStates.includes(state)
    }
    minimize(): DeterministicFiniteStateMachine{
        const {description: { transitions, acceptStates }} = this
        let initialEquivalenceClass: State[][]= []
        let allStates: State[] = []
        for (let key in transitions){
            allStates.push(key)
        }
        let nonacceptStates: State[] = []
        for (let entry of allStates){
            if (!acceptStates.includes(entry)){
                nonacceptStates.push(entry)
            }
        }
        initialEquivalenceClass.push(acceptStates)
        initialEquivalenceClass.push(nonacceptStates)
        let finalGroups = this.kEquivalence(initialEquivalenceClass, transitions)
        let minimizedDFA = this.minimizedDFA(finalGroups)
        return minimizedDFA
    }
    /**
     * performs k equivalence until the next equivalence equals to the previous one 
     * groups states by comparing entries of a dictionary 
     * dictionary contains the group # that state goes to with 0 and 1 
     * @param previousGroups 
     * @param transitions 
     */
    kEquivalence(previousGroups: State[][], transitions: { [key:string]: { 0: State, 1: State } }): State[][]{
        let newGroups: State[][] = []
        let state0: State = null
        let state1: State = null 
        let allStates: State[]
        allStates = Object.keys(transitions)  
        let kClass: { [key: string] : { 0: number, 1: number}} = {}
        for (let i= 0; i< previousGroups.length; i++){
            for (let j=0; j< previousGroups[i].length; j++){
               state0 = transitions[previousGroups[i][j]][0]
               state1 = transitions[previousGroups[i][j]][1]
               kClass[previousGroups[i][j]] = {0: this.groupIndex(state0, previousGroups), 1: this.groupIndex(state1, previousGroups)}   
            }
        }
        while(allStates.length > 0){
            let givenState: State = null
            let group: State[] = []
            givenState = allStates[0]
            group.push(givenState)
            allStates.splice(0, 1)
            
            for(let k=0; k< allStates.length; k++){
                if(JSON.stringify(kClass[givenState]) === JSON.stringify(kClass[allStates[k]]) && this.sameGroup(previousGroups, givenState, allStates[k])){
                    group.push(allStates[k])
                }
            }
            for(let l=1; l< group.length; l++){
                let idx = allStates.indexOf(group[l])
                allStates.splice(idx,1)
            }
            newGroups.push(group)
        }
        if (previousGroups.length === newGroups.length){
            return newGroups
        }
        return this.kEquivalence(newGroups, transitions)
    }

    /**
     * Checks if two states are in the same equivalence group  
     * @param groups 
     * @param state1 
     * @param state2 
     */
    sameGroup(groups: State[][], state1: State, state2: State): boolean{
        for(const group of groups){
            if (group.includes(state1) && group.includes(state2)){
                return true
            }
        }
        return false
    }

    /**
     * returns to which group number the given state is in 
     * @param givenState 
     * @param previousGroups 
     */
    groupIndex(givenState: State, previousGroups: State[][]): number{
        for(let i = 0; i< previousGroups.length; i++){
            for(let j=0; j < previousGroups[i].length; j++){
                if (previousGroups[i][j] == givenState){
                    return i
                }
            }
        }
        return null
    }
    /**
     * returns a minimized DFA 
     * @param groups 
     */
    minimizedDFA(groups:State[][]): DeterministicFiniteStateMachine{
        const {description: { transitions, acceptStates, start }} = this 
        let newDescription: DFADescription 
        let newTransitions = {}
        let newStateNames: State[] = []
        let newAcceptStates = []
        let newStart = ""
        for (let group of groups){
            let groupName = ""
            for (let i=0; i< group.length; i++){
                 groupName = groupName.concat(group[i])
            }
            newStateNames.push(groupName)
        }
        for(const name of newStateNames){
            let firstState = name.charAt(0)
            let transition0: string
            let transition1: string
            for(const name2 of newStateNames){
                if(name2.includes(transitions[firstState][0])){
                    transition0 = name2
                }
                if(name2.includes(transitions[firstState][1])){
                    transition1 = name2
                }
            }

            newTransitions[name] = {0: transition0, 1: transition1}
            for(let state of acceptStates){
                if(name.includes(state) && !newAcceptStates.includes(name)){
                    newAcceptStates.push(name)
                }
            }

            if (name.includes(start)){
                newStart = name
            }
        }
        
        newDescription = {
            "transitions": newTransitions,
            "start": newStart,
            "acceptStates": newAcceptStates
        }
        
        let minimizedDFA = new DeterministicFiniteStateMachine(newDescription)
        return minimizedDFA
    } 
}
   