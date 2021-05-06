// const Math = require('Math');
const debug = require('debug')('app:openLibraryService');
const axios = require('axios');
const { NText } = require('mssql');
// const { Parser } = require('xml2js');
// If API calls in XML : These 2 packages are to convert it to json
const xml2js = require('xml2js');
const parser = xml2js.Parser({ explicitArray: false });

function libraryService() {
    function getBookById(title) {
        return new Promise((resolve, reject) => {
            // Return Unavailable data if not found at Open Library
            const API_obj = {
                OLID_ID: 'Title Not found at Open Library',
                subject: 'Not Available',
                first_publish_year: 'Not Available',
                description: 'Not Available',
                link: 'Not Available',
                bookCover: undefined,
                authorpix: undefined
            };

            // Setting up query string
            const titleQuery = title.split(' ').join('+');
            // debug('titleQuery:', titleQuery);
            // There are 2 searches here: 
            // 1) Starts from title name,
            // 2) then narrow down to book OLID for the detailed search
            axios.get(`https://openlibrary.org/search.json?title=${titleQuery}`)
                .then((titleResponse) => {
                    // debug('titleResponse..........:::::', titleResponse.data);
                    const titleOlid = titleResponse.data.docs[0].key;

                    //Original Module
                    axios.get(`https://openlibrary.org${titleOlid}.json`)  //key: '/works/OL267171W'
                        .then((response) => {
                            // parser.parseString(response.data, (err, result) => {
                            //     if(err){
                            //         debug(err);
                            //     } else {
                            //         debug(result);
                            //         resolve({ description: result.description });
                            //     }
                            //  });

                            //Getting the correct /cleaning data here
                            // Check for not existed (undefined) values:
                            debug('response from OLID search:', response);

                            try {
                                API_obj.OLID_ID = titleOlid.slice(7);
                            } catch (error) {
                                debug('OLID_ID:', error);
                            };

                            if ('subject' in titleResponse.data.docs[0]) {
                                API_obj.subject = titleResponse.data.docs[0].subject;
                            }
                            // try {
                            //     API_obj.subject = titleResponse.data.docs[0].subject;
                            // } catch (error) {
                            //     debug('subject:', error);
                            // };

                            if ('first_publish_year' in titleResponse.data.docs[0]) {
                                API_obj.first_publish_year = titleResponse.data.docs[0].first_publish_year;
                            }
                            // try {
                            //     API_obj.first_publish_year = titleResponse.data.docs[0].first_publish_year;
                            // } catch (error) {
                            //     debug('first_publish_year:', error);
                            // };

                            if (('description' in response.data) == true) {
                                if (response.data.description.value != undefined) {
                                    API_obj.description = response.data.description.value;
                                } else {
                                    API_obj.description = response.data.description;
                                };
                            }
                            // try {
                            //     if (response.data.description.value != undefined) {
                            //         API_obj.description = response.data.description.value;
                            //     } else {
                            //         API_obj.description = response.data.description;
                            //     };
                            //     debug('descriptionLink', description);
                            // } catch (error) {
                            //     debug('descriptionLink:', error);
                            // };

                            if ('author' in response.data.authors[0]) {
                                const authorStr = response.data.authors[0].author.key;
                                API_obj.authorpix = authorStr.slice(9);
                            } else {
                                API_obj.authorpix = '';
                            }
                            // try {
                            //     const authorStr = response.data.authors[0].author.key;
                            //     API_obj.authorpix = authorStr.slice(9);
                            // } catch (error) {
                            //     debug('authorpix:', error);
                            //     API_obj.authorpix = '';
                            // };

                            if ('links' in response.data) {
                                if (response.data.links[0].url != undefined) {
                                    API_obj.link = response.data.links[0].url;
                                }
                            } else {
                                API_obj.link = 'Not Available';
                            }
                            // try {
                            //     API_obj.link = response.data.links[0].url;
                            // } catch (error) {
                            //     debug('link:', error);
                            //     API_obj.link = 'Not Available';
                            // };

                            if ('covers' in response.data) {
                                let coverArray = response.data.covers;
                                API_obj.bookCover = coverArray[Math.floor(Math.random() * coverArray.length)];
                            } else {
                                API_obj.bookCover = '';
                            }
                            // try {
                            //     let coverArray = response.data.covers;
                            //     API_obj.bookCover = coverArray[Math.floor(Math.random() * coverArray.length)]
                            // } catch (error) {
                            //     debug('bookCover:', error);
                            //     API_obj.bookCover = '';
                            // };

                            // for (let key in API_obj) {
                            //     if (API_obj[key] === undefined) {
                            //         API_obj[key] = 'N/A'
                            //     };
                            // };
                            resolve(API_obj);
                        })
                        .catch((error) => {
                            reject(error);
                            debug('Some data not found in Open Library', error);
                            // resolve(API_obj);
                        });
                })
                .catch((error) => {
                    // reject(error);
                    debug('title not found', error);
                    resolve(API_obj);
                });
        });
    }
    console.log('libraryService>getBookById', getBookById);
    return { getBookById };
}

module.exports = libraryService();