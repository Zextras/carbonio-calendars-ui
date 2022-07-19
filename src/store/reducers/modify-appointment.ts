/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import moment from 'moment';
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleModifyAppointmentPending = (state: any, { meta }: any) => {
	// eslint-disable-next-line no-param-reassign
	meta.prevApntState = state.appointments;
	state.appointments[meta?.arg?.appt?.resource?.id].inst[0].s = Number(
		moment(meta.arg.mailInvite[0].comp[0].s[0].u).format('x')
	);
	state.appointments[meta?.arg?.appt?.resource?.id].dur = moment(
		meta.arg.mailInvite[0].comp[0].e[0].u
	).diff(moment(meta.arg.mailInvite[0].comp[0].s[0].u));
	state.status = 'pending';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/explicit-function-return-type
export const handleModifyAppointmentFulfilled = (state: any, { meta, payload }: any) => {
	state.status = 'fullfiled';
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const handleModifyAppointmentRejected = (state: any, { meta }: any): void => {
	state.status = 'failed';
	state.appointments = meta.arg.prevApntState;
};
