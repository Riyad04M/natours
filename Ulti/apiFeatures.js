class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filter() {
    // 1A) filtering
    let qObj = { ...this.queryString };
    const exculdedFields = ['page', 'sort', 'limit', 'fields'];
    exculdedFields.forEach((el) => delete qObj[el]);

    // 1B) Advanced filtering
    let stringObj = JSON.stringify(qObj);
    console.log(stringObj);
    stringObj = stringObj.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    console.log(stringObj);
    qObj = JSON.parse(stringObj);
      console.log(qObj);
    this.query = this.query.find(qObj);
    return this;
  }
  sort() {
    // 2) Sorting

    if (this.queryString.sort) {
      const fields = this.queryString.sort.replace(',', () => ' ');
      this.query = this.query.sort(fields);
      // query.sort(fields);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }
  limitField() {
    // 3) limiting
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replace(/,/g, ' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    // 4) pagination

    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 10;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = ApiFeatures;
