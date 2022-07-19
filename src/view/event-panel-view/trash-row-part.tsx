/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useMemo } from 'react';
import { Container, Text, Icon, Divider, Row, Padding } from '@zextras/carbonio-design-system';
import moment from 'moment';
import styled from 'styled-components';
import { reduce } from 'lodash';
import { useSelector } from 'react-redux';
import { selectInstanceInvite } from '../../store/selectors/invites';
import { EventType } from '../../types/event';
import { Parts } from '../../types/store/invite';
import { Store } from '../../types/store/store';

const TitleText = styled(Text)`
	display: inline-block;
	color: black;
`;

const findAttachments = (parts: Parts, acc: Parts): Parts =>
	reduce(
		parts,
		(found, part) => {
			if (part.disposition === 'attachment') {
				found.push(part);
			}
			return findAttachments(part.parts ?? [], found);
		},
		acc as Parts
	);

export const TrashRow = ({ event }: { event: EventType }): ReactElement => {
	const { inviteId, ridZ, participationStatus } = event.resource;
	const invite = useSelector((state: Store) => selectInstanceInvite(state, inviteId, ridZ));

	const attachments = useMemo(() => findAttachments(invite?.parts ?? [], []), [invite]);

	return (
		<Container padding={{ all: 'small' }}>
			<Row orientation="horizontal" width="100%" mainAlignment="flex-start">
				<Row width="auto%">
					<Text size="large" overflow="break-word">
						{moment(event.start).format(
							`DD/MM/YYYY, [${moment(event.start).format(`HH:MM`)}]-[${moment(event.end).format(
								`HH:MM`
							)}]`
						)}
					</Text>
				</Row>
				<Row width="5%">
					<Icon icon="TrashOutline" />
				</Row>
				<Row width="60%" orientation="horizontal">
					<Text color="secondary">
						<TitleText weight="bold">{event.title} </TitleText>
						{event?.resource?.fragment?.length > 0 && <>&nbsp; -{event.resource.fragment}</>}
					</Text>
				</Row>
				<Row
					width="5%"
					orientation="horizontal"
					mainAlignment="baseline"
					padding={{ horizontal: 'large' }}
				>
					<Icon icon="Pricetags" customColor={event.resource.calendar.color.color} />
					<Padding horizontal="extrasmall">
						{' '}
						{attachments.length > 0 && <Icon icon="AttachOutline" />}
					</Padding>
				</Row>
				<Row width="10%" orientation="horizontal">
					{event.resource.location && event.resource.location.length > 0 && (
						<Text size="large" weight="bold">
							{event.resource.location}
						</Text>
					)}
				</Row>
				<Row width="5%" orientation="horizontal">
					{participationStatus === 'AC' && <Icon icon="CheckmarkOutline" />}
					{participationStatus === 'TE' && <Icon icon="QuestionMarkOutline" />}
					{participationStatus === 'DE' && <Icon icon="CloseOutline" />}
				</Row>
			</Row>
			<Divider />
		</Container>
	);
};
