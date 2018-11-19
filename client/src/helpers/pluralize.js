function pluralize(word, count){
    return count > 1 ? `${word}s` : word;
}

export default pluralize;