/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { cloneDeep, filter } from 'lodash';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const moveAppointmentToTrashPending = (state: any, { meta }: any): void => {
	const { ridZ, deleteSingleInstance, id } = meta.arg;

	state.status = 'pending';
	if (state.appointments) {
		// eslint-disable-next-line no-param-reassign
		meta.arg.prevState = cloneDeep(state);
		deleteSingleInstance
			? (state.appointments[id].inst = filter(
					state.appointments[id].inst,
					(inst) => inst.ridZ !== ridZ
			  ))
			: (state.appointments[id].l = '3');
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const moveAppointmentToTrashFulfilled = (state: any, { meta }: any): void => {
	state.status = 'fulFilled';
	const { inviteId, ridZ, deleteSingleInstance, isRecurrent, id } = meta.arg;
	if (state.invites) {
		if (!deleteSingleInstance) delete state?.invites?.[inviteId];
	}

	if (state.appointments && isRecurrent) {
		state.appointments[id].inst = filter(state.appointments[id].inst, (inst) => inst.ridZ !== ridZ);
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const moveAppointmentToTrashRejected = (state: any, { meta }: any): void => {
	if (state.appointments) {
		// eslint-disable-next-line no-param-reassign
		state = meta.arg.prevState;
		state.status = 'error';
	}
};
