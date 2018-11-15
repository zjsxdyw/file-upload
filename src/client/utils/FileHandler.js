import SparkMD5 from 'spark-md5'
import Observer from './Observer.js'
let blobSlice = File.prototype.slice || File.prototype.mozSlice || File.prototype.webkitSlice;

class FileHandler extends Observer {
  /**
   * Constructor
   * @param {File} file
   * @param {Number} chunkSize
   */
  constructor(file, chunkSize) {
    super();
    this.file = file;
    this.size = file.size;
    this.chunkSize = chunkSize || 1024 * 1024 * 4;
    this.total = Math.ceil(this.size / this.chunkSize);
  }
  /**
   * Calculate the md5 value of the file
   */
  calculate() {
    let index = 0;
    let size = this.size;
    let chunkSize = this.chunkSize;
    let file = this.file;
    let total = this.total;
    let fileReader = new FileReader();
    let spark = new SparkMD5.ArrayBuffer();
    let chunkFile;

    fileReader.onload = (event) => {
      let chunkSpark = new SparkMD5.ArrayBuffer();
      console.time('spark-md5:' + index);
      spark.append(event.target.result);
      chunkSpark.append(event.target.result);
      let md5 = chunkSpark.end();
      console.timeEnd('spark-md5:' + index);
      this.fireEvent('chunkLoad', chunkFile, md5, index);
      index++;
      if(index === total) this.fireEvent('load', file, spark.end());
      else read();
    };

    fileReader.onerror = (event) => {
      console.warn('oops, something went wrong.');
      this.fireEvent('error');
    };

    const read = () => {
      let start = chunkSize * index;
      let end = (start + chunkSize) >= size ? size : (start + chunkSize);
      chunkFile = blobSlice.call(file, start, end);
      fileReader.readAsArrayBuffer(chunkFile);
    };

    read();

  }
}

export default FileHandler;