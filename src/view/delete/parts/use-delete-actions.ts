/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { SnackbarManagerContext } from '@zextras/zapp-ui';
import moment from 'moment';
import { useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { modifyAppointment } from '../../../store/actions/new-modify-appointment';
import { deleteEvent, sendResponse } from './delete-actions';
import { moveAppointmentRequest } from '../../../store/actions/move-appointment';

const generateAppointmentDeletedSnackbar = (
	res: any,
	t: any,
	createSnackbar: any,
	undoAction?: () => void
): any => {
	if (res.type.includes('fulfilled')) {
		createSnackbar({
			key: 'send',
			replace: true,
			type: 'info',
			label: undoAction
				? t('message.snackbar.appt_moved_to_trash', 'Appointment moved to trash')
				: t('message.snackbar.appointment_permanently_deleted', 'Appointment permanently deleted'),
			autoHideTimeout: 3000,
			hideButton: undoAction,
			actionLabel: t('label.undo', 'Undo'),
			onActionClick: () => (undoAction ? undoAction() : null)
		});
	} else {
		createSnackbar({
			key: `delete`,
			replace: true,
			type: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000,
			hideButton: true
		});
	}
};

const generateAppointmentRestoredSnackbar = (
	res: { type: string | string[] },
	t: any,
	createSnackbar: any
): any => {
	if (res.type.includes('fulfilled')) {
		createSnackbar({
			key: 'send',
			replace: true,
			type: 'success',
			label: t('appt_restored_successfully', 'Appointment restored successfully'),
			autoHideTimeout: 3000,
			hideButton: true
		});
	} else {
		createSnackbar({
			key: `delete`,
			replace: true,
			type: 'error',
			label: t('label.error_try_again', 'Something went wrong, please try again'),
			autoHideTimeout: 3000,
			hideButton: true
		});
	}
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const useDeleteActions = (event: any, invite: any, context: any): any => {
	const [t] = useTranslation();
	const dispatch = useDispatch();
	const createSnackbar = useContext(SnackbarManagerContext);
	const [deleteAll, setDeleteAll] = useState(true);
	const [notifyOrganizer, setNotifyOrganizer] = useState(false);

	const toggleNotifyOrganizer = useCallback(() => {
		setNotifyOrganizer((a) => !a);
	}, []);

	const toggleDeleteAll = useCallback(() => {
		setDeleteAll((a) => !a);
	}, []);

	const deleteNonRecurrentEvent = useCallback(
		(newMessage) => {
			let isCanceled = false;
			const restoreAppointment = (): void => {
				isCanceled = true;
				dispatch(
					moveAppointmentRequest({
						id: event.resource.id,
						l: event.resource.calendar.id
					})
				)
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					.then((res: any) => {
						generateAppointmentRestoredSnackbar(res, t, createSnackbar);
					});
			};
			context.onClose();
			const ctxt = {
				dispatch,
				t,
				isInstance: context.isInstance,
				createSnackbar,
				newMessage: newMessage?.text?.[0]
			};
			deleteEvent(event, invite, ctxt)
				.then((res: any) => {
					generateAppointmentDeletedSnackbar(res, t, createSnackbar, restoreAppointment);
				})
				.then(
					setTimeout(() => {
						if (notifyOrganizer && !isCanceled) {
							sendResponse(event, invite, ctxt);
						}
					}, 5000)
				);
		},
		[context, createSnackbar, dispatch, event, invite, notifyOrganizer, t]
	);

	const deleteRecurrentSerie = useCallback(
		(newMessage) => {
			let isCanceled = false;
			const restoreRecurrentSeries = (): void => {
				isCanceled = true;
				dispatch(
					moveAppointmentRequest({
						id: event.resource.id,
						l: event.resource.calendar.id
					})
				)
					// eslint-disable-next-line @typescript-eslint/ban-ts-comment
					// @ts-ignore
					.then((res: any) => {
						generateAppointmentRestoredSnackbar(res, t, createSnackbar);
					});
			};
			context.onClose();
			const ctxt = {
				dispatch,
				t,
				isInstance: context.isInstance,
				createSnackbar,
				newMessage: newMessage?.text?.[0]
			};
			const deleteFunction = (): void =>
				!deleteAll
					? dispatch(
							modifyAppointment({
								invite: {
									...invite,
									recurrenceRule: [
										{
											add: [
												{
													rule: [
														{
															...invite?.recurrenceRule[0]?.add[0]?.rule[0],
															until: [
																{
																	d: moment(event?.resource?.ridZ)
																		.subtract(1, 'day')
																		.format('YYYYMMDD')
																}
															]
														}
													]
												}
											]
										}
									]
								}
							})
					  )
					: deleteEvent(event, invite, ctxt);

			deleteFunction()
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				.then((res: any) => {
					generateAppointmentDeletedSnackbar(res, t, createSnackbar, restoreRecurrentSeries);
				})
				.then(
					setTimeout(() => {
						if (notifyOrganizer && !isCanceled) {
							sendResponse(event, invite, ctxt);
						}
					}, 5000)
				);
		},

		[context, createSnackbar, deleteAll, dispatch, event, invite, notifyOrganizer, t]
	);

	const deleteRecurrentInstance = useCallback(
		(newMessage) => {
			const isCanceled = false;
			context.onClose();
			const ctxt = {
				dispatch,
				newMessage: newMessage?.text?.[0],
				t,
				isInstance: context.isInstance,
				createSnackbar,
				inst: {
					d: invite?.start?.tz
						? moment(event.start).format('YYYYMMDD[T]HHmmss')
						: moment(event.start).utc().format('YYYYMMDD[T]HHmmss[Z]'),
					tz: invite?.start?.tz
				},
				s: moment(event.start).valueOf()
			};
			deleteEvent(event, invite, ctxt)
				.then((res: any) => {
					generateAppointmentDeletedSnackbar(res, t, createSnackbar);
				})
				.then(
					setTimeout(() => {
						if (notifyOrganizer && !isCanceled) {
							sendResponse(event, invite, ctxt);
						}
					}, 5000)
				);
		},
		[context, createSnackbar, dispatch, event, invite, notifyOrganizer, t]
	);

	return useMemo(
		() => ({
			deleteNonRecurrentEvent,
			deleteRecurrentInstance,
			deleteRecurrentSerie,
			toggleNotifyOrganizer,
			toggleDeleteAll,
			deleteAll,
			notifyOrganizer
		}),
		[
			deleteNonRecurrentEvent,
			deleteRecurrentInstance,
			deleteRecurrentSerie,
			deleteAll,
			toggleDeleteAll,
			notifyOrganizer,
			toggleNotifyOrganizer
		]
	);
};
