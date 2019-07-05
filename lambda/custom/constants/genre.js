/**
 * どの言葉がどのジャンルに属するかを定義します
 */
class GenreGetter {
  constructor() {
     // ここに値と言葉のマッピングを書きます
    this.genres = [
      {
        value: 1,
        words: [ '食費', '飯代', 'ご飯代' ],
        color: 'rgba(255, 99, 132, 0.2)'
      },
      {
        value: 2,
        words: [ '交通費', '電車賃', 'バス代', 'タクシー代' ],
        color: 'rgba(54, 162, 235, 0.2)'
      },
      {
        value: 3,
        words: [ '家賃' ],
        color: 'rgba(255, 206, 86, 0.2)'
      },
      {
        value: 4,
        words: [ '交際費', '飲み代' ],
        color: 'rgba(75, 192, 192, 0.2)'
      },
      {
        value: 5,
        words: [ '水道・光熱費', '水道代', '光熱費', '水道費', '電気代' ],
        color: 'rgba(153, 102, 255, 0.2)'
      }
    ]
  }
  
  // 値から言葉のリストを取得します
  getWordsByValue(value) {
    let genre = this.genres.filter(g => g.value == value)
    console.log(`get word : ${value}`)
    console.dir(genre)
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
    console.log(`get value : ${word}`)
    console.dir(genre)
    if (genre.length === 1) {
      return genre[0].value
    } else if (genre.length === 0) {
      return null
    }else {
      throw new Error('同じジャンルが複数のvalueに紐づいています')
    }
  }

  // 値から色を取得します
  getColorByValue(value) {
    let genre = this.genres.filter(g => g.value === value)
    console.log(`get color : ${value}`)
    console.dir(genre)
    if (genre.length === 1) {
      return genre[0].color
    } else if (genre.length === 0) {
      return null
    } else {
      throw new Error('同じvalueをもつジャンルが複数存在します')
    }
  }
}

module.exports = new GenreGetter()
