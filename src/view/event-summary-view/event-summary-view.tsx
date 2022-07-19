/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';
import { Container, Divider, Popover } from '@zextras/carbonio-design-system';
import { isNil, omitBy, startsWith } from 'lodash';
import { EventType } from '../../types/event';
import { Invite } from '../../types/store/invite';
import { TitleRow } from './title-row';
import { NeverSentWarningRow } from './never-sent-warning-row';
import { CalendarInfoRow } from './calendar-info-row';
import { LocationRow } from './location-row';
import { ParticipantsRow } from './participants-row';
import { DescriptionFragmentRow } from './description-fragment-row';
import { ActionsButtonsRow } from './actions-buttons-row';
import { TimeInfoRow } from './time-info-row';
import { VirtualRoomRow } from './virtual-room-row';
import { ROOM_DIVIDER } from '../../commons/body-message-renderer';
import TagsRow from './tags-row';

type EventSummaryProps = {
	anchorRef: React.RefObject<HTMLElement>;
	open: boolean;
	event: EventType;
	onClose: () => void;
	invite: Invite | undefined;
};

export const EventSummaryView = ({
	anchorRef,
	open,
	event,
	onClose,
	invite
}: EventSummaryProps): ReactElement | null => {
	const timeData = useMemo(
		() =>
			omitBy(
				{
					allDay: event.allDay,
					start: event.start,
					end: event.end
				},
				isNil
			),
		[event.allDay, event.end, event.start]
	);

	const locationData = useMemo(
		() =>
			omitBy(
				{
					class: event.resource.class,
					location: event.resource.location,
					locationUrl: event.resource.locationUrl
				},
				isNil
			),
		[event?.resource?.class, event?.resource?.location, event?.resource?.locationUrl]
	);

	return invite ? (
		<Popover anchorEl={anchorRef} open={open} styleAsModal placement="left" onClose={onClose}>
			<Container
				padding={{ top: 'medium', horizontal: 'small', bottom: 'extrasmall' }}
				width="400px"
			>
				<TitleRow event={event} />
				<NeverSentWarningRow neverSent={event?.resource?.inviteNeverSent} />
				<CalendarInfoRow />
				{timeData && <TimeInfoRow timeInfoData={timeData} showIcon />}
				{locationData && <LocationRow locationData={locationData} showIcon />}
				{invite?.xprop && <VirtualRoomRow xprop={invite?.xprop} showIcon />}
				<ParticipantsRow event={event} invite={invite} />
				{typeof invite?.tags?.length === 'number' && invite?.tags?.length > 0 && (
					<TagsRow invite={invite} />
				)}
				{!startsWith(event?.resource?.fragment ?? '', ROOM_DIVIDER) && (
					<DescriptionFragmentRow event={event} />
				)}
				<Divider />
				<ActionsButtonsRow event={event} onClose={onClose} invite={invite} />
			</Container>
		</Popover>
	) : null;
};
