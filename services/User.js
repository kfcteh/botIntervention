import models from '../app/db/models';
import { getUserProfile } from '../bot/fBBot';

export function updateUserFromFBEvent(event) {
  getUserProfile(event.sender.id).then((profile) => {
    const values = {
      fbId: event.sender.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      botState: {},
    }
    models.User.findOne({ 
      where: {
        fbId: event.sender.id,
      }
    }).then((obj) => {
      if(obj) { // update
        return obj.update(values);
      }
      else { // insert
        return models.User.create(values);
      }
    });
  }).catch((err) => {
    console.err(err);
  });
};

