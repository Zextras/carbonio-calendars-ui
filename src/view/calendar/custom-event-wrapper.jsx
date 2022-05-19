/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { useRef, cloneElement, useCallback, useState, useContext, useEffect } from 'react';
import styled from 'styled-components';
import { setLightness } from 'polished';
import { Container, ModalManagerContext } from '@zextras/carbonio-design-system';
import { useDispatch, useSelector } from 'react-redux';
import { replaceHistory } from '@zextras/carbonio-shell-ui';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { EventResumeView } from '../event-resume-view/event-resume';
import { EventActionsEnum } from '../../types/enums/event-actions-enum';
import { getInvite } from '../../store/actions/get-invite';
import { selectInstanceInvite } from '../../store/selectors/invites';
import { AppointmentTypeHandlingModal } from './appointment-type-handle-modal';
import { useAppStatusStore } from '../../store/zustand/store';
import { useActiveResume } from '../../store/zustand/hooks';

export const CustomEventWrapperStyler = styled.div`
	.rbc-event {
		color: ${({ event, theme }) => {
			switch (event.resource.status) {
				case 'declined':
					return theme.palette.gray0.regular;
				case 'tentative':
				case 'accepted':
				default:
					return event.resource.calendar.color.color;
			}
		}};
		background-color: ${({ event, theme }) => {
			switch (event.resource.status) {
				case 'declined':
					return theme.palette.gray3.regular;
				case 'tentative':
					return theme.palette.gray6.regular;
				case 'accepted':
				default:
					return event.resource.calendar.color.background;
			}
		}};
		border: ${({ event }) => `1px solid ${event.resource.calendar.color.color} !important`};
		box-sizing: border-box;
		margin: 0;
		padding: ${({ event }) =>
			moment(event.end).diff(event.start, 'minutes') >= 30
				? '4px 8px'
				: '1px 8px 4px 8px !important'};
		border-radius: 4px;
		cursor: pointer;
		width: 100%;
		text-align: left;
		transition: border 0.15s ease-in-out, background 0.15s ease-in-out;
		box-shadow: 0px 0px 14px -8px rgba(0, 0, 0, 0.5);
	}
	.rbc-slot-selecting .rbc-event {
		cursor: inherit;
		pointer-events: none;
	}
	.rbc-event.rbc-selected {
		/* background-color: ${({ event }) =>
			setLightness(0.95, event.resource.calendar.color.background)}; */
		border: 1px solid ${({ event }) => event.resource.calendar.color.color};
	}
	.rbc-event:focus {
		background-color: ${({ event }) => setLightness(0.8, event.resource.calendar.color.background)};
	}
	.rbc-event-label {
		display: none;
	}

	.rbc-event-overlaps {
		box-shadow: -1px 1px 5px 0px rgba(51, 51, 51, 0.5);
	}

	.rbc-event-continues-prior {
		border-top-left-radius: 0;
		border-bottom-left-radius: 0;
	}

	.rbc-event-continues-after {
		border-top-right-radius: 0;
		border-bottom-right-radius: 0;
	}

	.rbc-event-continues-earlier {
		border-top-left-radius: 0;
		border-top-right-radius: 0;
	}

	.rbc-event-continues-later {
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 0;
	}
`;

export default function CustomEventWrapper({ event, children }) {
	const anchorRef = useRef();
	const [open, setOpen] = useState(false);
	const dispatch = useDispatch();
	const { action } = useParams();
	const createModal = useContext(ModalManagerContext);

	const invite = useSelector((state) =>
		selectInstanceInvite(state, event.resource.inviteId, event.resource.ridZ)
	);

	const showPanelView = useCallback(() => {
		if (event?.resource?.isRecurrent) {
			const closeModal = createModal(
				{
					children: <AppointmentTypeHandlingModal event={event} onClose={() => closeModal()} />
				},
				true
			);
		} else {
			setOpen(false);
			replaceHistory(
				`/${event.resource.calendar.id}/${EventActionsEnum.EXPAND}/${event.resource.id}/${event.resource.ridZ}`
			);
		}
	}, [event, createModal]);

	const toggleOpen = useCallback(
		(e) => {
			if (!invite) {
				dispatch(getInvite({ inviteId: event.resource.inviteId, ridZ: event.resource.ridZ }));
			}
			if (e.detail === 1 && action !== EventActionsEnum.EXPAND) {
				setOpen(true);
				useAppStatusStore.setState((s) => ({ ...s, isResumeViewOpen: true }));
			}
		},
		[action, dispatch, event.resource.inviteId, event.resource.ridZ, invite]
	);

	const onClose = useCallback(() => setOpen(false), []);

	return (
		<>
			<EventResumeView
				anchorRef={anchorRef}
				event={event}
				open={open}
				onClose={onClose}
				invite={invite}
				dispatch={dispatch}
			/>
			<CustomEventWrapperStyler event={event}>
				<Container style={{ background: 'red' }}>
					{/* this is needed because from the addition of d&d plugin a new wrapper is placed between
					customEvent and Event so we need to pass those props to the next child component  */}
					{cloneElement(children, {
						...children.props,
						children: cloneElement(children.props.children, {
							...children.props.children,
							onClick: toggleOpen,
							ref: anchorRef,
							onDoubleClick: showPanelView
						})
					})}
				</Container>
			</CustomEventWrapperStyler>
		</>
	);
}
