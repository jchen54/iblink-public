const path = require('path');
const Promise = require('bluebird');

const presentation = require('../models/presentation');
const channel = require('../models/channel');
// const configureStore = require('../../common/store/configureStore');
const bookmarkUtil = require('../models/bookmark');
const noteUtil = require('../models/note');

let maxSlide = 0;  // TODO: improve after MVP to support multiple presentations
const getTargetPresentationSlides = Promise.promisify(require('../models/slide').getTargetPresentationSlides);

module.exports = {

  homepage: {
    get(req, res) {
      const channelNumber = req.query.channel;
      const sockets = {
        sentUrl: '',
        presenterIsOn: true,
        audienceIsOn: true
      };
      if (channel.channelIsLive(channelNumber)) {
        sockets.channel = channelNumber;
        sockets.receivedUrlId = 0;
      } else {
        sockets.channel = null;
        sockets.receivedUrlId = null;
      }

      presentation.getAllPresentations('0', (err, presentations) => {
        if (err) {
          console.log('Error getting all presentations', err);
        }
        // console.log('Success getting all presentations!!!! presentations:', presentations);
        // ************* INITIAL STORE ******************
        let preloadedState = {
          // livePresentation,
          // Object with:
          // * channel,
          // * presentationIndex, (in the presentations array below)
          // * currentSlideIndex, (in the slides array below)
          // * maxSlideIndex (in the slides array below)
          selectedPresentationIndex: 0,
          presentations,
          // title,
          // id,  (database ID)
          // slides: [ {original: url, thumbnail: url}, ... ]
          sockets
        };
        // ***********************************************

        // const store = configureStore(preloadedState);
        console.log('*******************************');
        console.log('Sending the following state to the React client:', preloadedState);

        preloadedState = JSON.stringify(preloadedState).replace(/</g, '\\x3c');
      // console.log('preloadedState', preloadedState);
        res.render('master', { preloadedState });
      });
    }
  },

  channel: {
    get(req, res) {
      res.redirect(`/?channel=${req.params.id}`);
    }
  },

  liveChannel: {
    get(req, res) {
      const newChannel = channel.getNewChannel();
      res.json(newChannel);
    }
  },

  presentation: {
    get(req, res) {
      res.json(presentation.getPresentation());
      // TODO later: async access to DB:
      // users.get((err, results) => {
      //   if (err) { /* do something */ }
      //   res.json(results);
      // });
    },
    post(req, res) {
      // const params = [req.body.username];
      // models.users.post(params, (err, results) => {
      //   if (err) { /* do something */ }
      //   res.sendStatus(201);
      // });
    }
  },

  audience_presentation: {
    get(req, res) {
      res.json(maxSlide);
    },
    post(req, res) {
      maxSlide = req.body.maxSlide;
      console.log(maxSlide);
      res.json();
    }
  },

  audience_presentation_add_bookmark: {
    get(req, res) {
      res.json(bookmarkedSlides);
    },
    post(req, res) {
      const slideIndex = req.body.slideIndex;
      const userId = req.body.userId;
      const presentationId = req.body.presentationId;

      getTargetPresentationSlides(presentationId)
      .then((targetPresentationSlides) => {
        bookmarkUtil.addBookmark(targetPresentationSlides[slideIndex].dataValues.image_url, userId, presentationId);
        console.log('slide at index ', slideIndex, ' is added to bookmarked');
        res.json('slide at index ', slideIndex, ' is added to bookmarked');
      })
      .catch(err => console.log(err));
    }
  },

  audience_presentation_remove_bookmark: {
    post(req, res) {
      const slideIndex = req.body.slideIndex;
      const userId = req.body.userId;
      const presentationId = req.body.presentationId;

      getTargetPresentationSlides(presentationId)
      .then((targetPresentationSlides) => {
        bookmarkUtil.removeBookmark(targetPresentationSlides[slideIndex].dataValues.image_url, userId, presentationId);
        console.log('slide at index ', slideIndex, ' is being removed from bookmarked');
        res.json('slide at index ', slideIndex, ' is removed from bookmarked');
      })
      .catch(err => console.log(err));
    }
  },

  audience_presentation_note: {
    post(req, res) {
      noteUtil.storeNote(req.body);
      res.status(201).send(JSON.stringify('Note Saved Successfully!'));
    },

    put(req, res) {
      noteUtil.updateNote(req.body);
      res.status(200).send(JSON.stringify('Note Updated Successfully!'));
    },

    delete(req, res) {
      noteUtil.deleteNote(req.body);
      res.status(200).send(JSON.stringify('Note Deleted Successfully!'));
    }
  },

  // audience_presentation_get_bookmarks: {
  //   get(req, res) {
  //     res.json(bookmarkedSlides);
  //   }
  // },

  // upload slides into database
  presenter_presentation: {
    post(req, res) {
      console.log('In server controller, getting presentation:', req.body.newPresentation);
      presentation.storePresentation(req.body.newPresentation, (err, result) => {
        // res.writeHead({
        //   'Content-Type': 'application/json',
        //   'Access-Control-Allow-Origin': '*',
        //   'Access-Control-Allow-Headers': 'content-type'
        // });
        if (err) {
          console.log('Server controller error:', err);
          res.sendStatus(500);
        } else {
          // res.status(201);
          console.log('In server ctlr, sending updated pres:', result);
          res.status(201).end(JSON.stringify(result));  // return the whole presentation with IDs
        }
      });
    }
  },

  metrics: {
    get(req, res) {
      const presentationId = req.query.presentationId;
      // declare a variable initialized at an empty array to store the resulting metrics data
      const metricsData = [];
      // declare a variable that stores the result of the slideUtil function that queries db to get all the slides of that presentation id
      // iterate over the target slides
      // query db to get the count of bookmarks with set presentation id and set slide index
      // query db to get the count of notes with set presentation id and set slide index
      res.json(metricsData);
      // [
      //   {
      //     notes: '10',
      //     bookmarks: '13',
      //     slide: '1'
      //   }, {
      //     notes: '0',
      //     bookmarks: '2',
      //     slide: '2'
      //   }, {
      //     notes: '5',
      //     bookmarks: '6',
      //     slide: '3'
      //   }, {
      //     notes: '12',
      //     bookmarks: '0',
      //     slide: '4'
      //   }, {
      //     notes: '7',
      //     bookmarks: '2',
      //     slide: '5'
      //   }
      // ]
    }
  },

  get_user_data: {
    get(req, res) {
      console.log('successfully gotten user data', req.params.userId)
    }
  }
};
