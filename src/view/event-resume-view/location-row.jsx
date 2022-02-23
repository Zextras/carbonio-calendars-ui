/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Row, Text, TextWithTooltip } from '@zextras/carbonio-design-system';
import React from 'react';

export const LocationRow = ({ event }) =>
	event?.resource?.class !== 'PRI' && (
		<>
			{event.resource.location && event.resource.location.length > 0 && (
				<Row
					style={{ overflow: 'hidden' }}
					mainAlignment="flex-start"
					padding={{ bottom: 'small' }}
				>
					<Text color="gray1" size="small">
						{event.resource.locationUrl ? (
							<a href={event.resource.locationUrl} target="_blank" rel="noreferrer">
								{event.resource.location}
							</a>
						) : (
							event.resource.location
						)}
					</Text>
				</Row>
			)}
		</>
	);
