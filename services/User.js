import models from '../app/db/models';
import { getUserProfile } from '../bot/fBBot';

import states from '../bot/states';

export async function updateFromFbEvent(event) {
  try {
    const profile = await getUserProfile(event.sender.id);

    const createValues = {
      fbId: event.sender.id,
      firstName: profile.first_name,
      lastName: profile.last_name,
      botState: {},
    };
    const updateValues = {
      firstName: profile.first_name,
      lastName: profile.last_name,
    };

    const user = await models.User.findOne({
      where: {
        fbId: event.sender.id,
      },
    });

    if (user) { // update
      return await user.update(updateValues);
    }
    return await models.User.create(createValues);
  } catch (err) {
    console.error('services/User.js updateUserFromFBEvent(event)========>', err);
  }
}

function setState(state, user) {
  return user.update({
    botState: {
      state,
    },
  });
}

export function findByFbId(id) {
  return models.User.findOne({
    where: {
      fbId: id,
    },
  });
}
export function setHelpState(user) {
  setState(states.HELP, user);
}
export function setNormalState(user) {
  setState(states.NORMAL, user);
}
