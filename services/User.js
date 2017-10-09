import models from '../app/db/models';
import { getUserProfile } from '../bot/fBBot';

export async function updateUserFromFbEvent(event) {
  try {
    const profile = await getUserProfile(event.sender.id);

    const values = {
      fbId: event.sender.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      botState: {},
    };

    const user = await models.User.findOne({
      where: {
        fbId: event.sender.id,
      },
    });

    if (user) { // update
      return await user.update(values);
    }
    return await models.User.create(values);
  } catch (err) {
    console.error('services/User.js updateUserFromFBEvent(event)========>', err);
  }
}

