/**
 * どの言葉がどのジャンルに属するかを定義します
 */
class GenreGetter {
  constructor() {
     // ここに値と言葉のマッピングを書きます
    this.genres = [
      {
        value: 1,
        words: [ '食費' ]
      },
      {
        value: 2,
        words: [ '交通費', '電車賃', 'バス代', 'タクシー代' ]
      }
    ]
  }
  
  // 値から言葉のリストを取得します
  getWordsByValue(value) {
    let genre = this.genres.filter(g => g.value === value)
    if (genre.length === 1) {
      return genre[0].words
    } else if (genre.length === 0) {
      return []
    } else {
      throw new Error('同じvalueをもつジャンルが複数存在します')
    }
  }

  // 言葉から値を取得します
  getValueByWord(word) {
    let genre = this.genres.filter(g => g.words.indexOf(word) !== -1)
    if (genre.length === 1) {
      return genre[0].value
    } else if (genre.length === 0) {
      return null
    }else {
      throw new Error('同じジャンルが複数のvalueに紐づいています')
    }
  }
}

module.exports = new GenreGetter()
