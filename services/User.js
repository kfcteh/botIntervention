import models from '../app/db/models';
import { getUserProfile } from '../bot/fBBot';

import states from '../bot/states';


/**
 * Update User Profile from facebook event
 *
 * @export
 * @param {any} event 
 * @returns promise
 */
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
      return user.update(updateValues);
    }
    return models.User.create(createValues);
  } catch (err) {
    console.error('services/User.js updateUserFromFBEvent(event)========>', err);
  }
}

/**
 * Updates user state column in database
 *
 * @param {any} state 
 * @param {any} user 
 * @returns promise
 */
function setState(state, user) {
  return user.update({
    botState: {
      state,
    },
  });
}

/**
 * Finds user by facebook id
 *
 * @export
 * @param {any} id 
 * @returns proimse
 */
export function findByFbId(id) {
  return models.User.findOne({
    where: {
      fbId: id,
    },
  });
}

/**
 * Changes the users state to HELP
 *
 * @export
 * @param {any} user
 */
export function setHelpState(user) {
  setState(states.HELP, user);
}


/**
 * Changes the users state to NORMAL
 *
 * @export
 * @param {any} user
 */
export function setNormalState(user) {
  setState(states.NORMAL, user);
}
